/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import crypto, { KeyObject } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import fs from "node:fs/promises";
import jwt from "jsonwebtoken";
import { HTTPError } from "lambert-server/HTTPError";
import { InstanceBan, Session, User } from "@spacebar/database";
import { Random, sleep, Stopwatch, TimeSpan } from "@spacebar/extensions";
import { Config } from "./Config";
import { OrmUtils } from "@spacebar/util";
import { clearInterval, setInterval } from "node:timers";
import { ProcessLifecycle } from "@spacebar/util/util/ProcessLifecycle";

/// Change history:
/// 1 - Initial version with HS256
/// 2 - Switched to ES512
/// 3 - Add version, device id to token payload
export const CurrentTokenFormatVersion: number = 3;

export type UserTokenData = {
    user: User;
    session?: Session;
    tokenVersion: number;
    decoded: {
        id: string;
        iat: number;
        // token format version
        ver?: number;
        // device id
        did?: string;
    };
};

function logAuth(text: string) {
    if (process.env.LOG_AUTH !== "true") return;
    console.log(`[AUTH] ${text}`);
}

function rejectAndLog(rejectFunction: (reason?: unknown) => void, httpCode: number | undefined, reason: string) {
    console.error(reason);
    rejectFunction(new HTTPError(reason, httpCode ?? 400));
}

export const checkToken = (
    token: string,
    opts?: {
        select?: string[]; // TODO: clean up
        relations?: string[]; // TODO: clean up
        ipAddress?: string;
        fingerprint?: string;
    },
): Promise<UserTokenData> =>
    new Promise((resolve, reject) => {
        token = token.replace("Bot ", ""); // there is no bot distinction in sb
        token = token.replace("Bearer ", ""); // allow bearer tokens

        let legacyVersion: number | undefined = undefined;

        const validateUser: jwt.VerifyCallback = async (err, out) => {
            const decoded = out as UserTokenData["decoded"];
            if (err || !decoded) {
                logAuth("validateUser rejected: " + err);
                return rejectAndLog(reject, 401, "Invalid Token meow " + err);
            }

            // eslint-disable-next-line prefer-const
            let [user, session] = await Promise.all([
                User.findOne({
                    where: { id: decoded.id },
                    select: OrmUtils.keysToObject([...(opts?.select || []), "id", "bot", "disabled", "deleted", "rights", "data"]), // TODO: clean up
                    relations: !opts?.relations ? undefined : OrmUtils.keysToObject(opts.relations), // TODO: clean up
                }),
                decoded.did ? Session.findOne({ where: { session_id: decoded.did, user_id: decoded.id } }) : undefined,
            ]);

            if (!user) {
                logAuth("validateUser rejected: User not found");
                return rejectAndLog(reject, 401, "User not found");
            }

            // we need to round it to seconds as it saved as seconds in jwt iat and valid_tokens_since is stored in milliseconds
            if (decoded.iat * 1000 < new Date(user.data.valid_tokens_since).setSeconds(0, 0)) {
                logAuth("validateUser rejected: Token not yet valid");
                return rejectAndLog(reject, 401, "Invalid Token");
            }

            if (user.disabled) {
                logAuth("validateUser rejected: User disabled");
                return rejectAndLog(reject, 401, "User disabled");
            }

            if (user.deleted) {
                logAuth("validateUser rejected: User deleted");
                return rejectAndLog(reject, 401, "User not found");
            }

            const banReasons = await InstanceBan.findInstanceBans({ userId: user.id, ipAddress: opts?.ipAddress, fingerprint: opts?.fingerprint, propagateBan: true });
            if (banReasons.length > 0) {
                logAuth("validateUser rejected: User banned for reasons: " + banReasons.join(", "));
                return rejectAndLog(reject, 418, "Invalid Token");
            }

            if (session && TimeSpan.fromDates(session.last_seen?.getTime() ?? 0, new Date().getTime()).totalSeconds >= 15) {
                session.last_seen = new Date();
                let updateIpInfoPromise;
                if (opts?.ipAddress && opts?.ipAddress !== session.last_seen_ip) {
                    session.last_seen_ip = opts.ipAddress;
                    updateIpInfoPromise = session.updateIpInfo();
                }
                await Promise.all([session.save(), updateIpInfoPromise]);
            }

            const result: UserTokenData = {
                decoded,
                session: session ?? undefined,
                user,
                // v1 can be told apart, v2 cant outside of missing device id and version
                tokenVersion: decoded.ver ?? legacyVersion ?? 2,
            };

            if (process.env.LOG_TOKEN_VERSION) console.log("User", user.id, "logged in with token version", result.tokenVersion);

            logAuth("validateUser success: " + JSON.stringify(result));
            return resolve(result);
        };

        const dec = jwt.decode(token, { complete: true });
        if (!dec) return void rejectAndLog(reject, 500, "Failed to decode token");
        logAuth("Decoded token: " + JSON.stringify(dec));

        if (dec.header.alg == "HS256" && Config.get().security.jwtSecret !== null) {
            legacyVersion = 1;
            jwt.verify(token, Config.get().security.jwtSecret!, { algorithms: ["HS256"] }, validateUser);
        } else if (dec.header.alg == "ES512") {
            jwt.verify(token, JwtKeypairManager.keypair.publicKey, { algorithms: ["ES512"] }, validateUser);
        } else return void rejectAndLog(reject, 400, "Unsupported token algorithm: " + dec.header.alg);
    });

export async function generateToken(id: string, isAdminSession: boolean = false): Promise<string | undefined> {
    const iat = Math.floor(Date.now() / 1000);
    const keyPair = JwtKeypairManager.keypair;

    let newSession;
    do {
        newSession = Session.create({
            session_id: Random.getString("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10), // readable at a glance
            user_id: id,
            is_admin_session: isAdminSession,
            client_status: {},
            status: "offline", // will be set to online upon IDENTIFY
            client_info: {},
        });
    } while (await Session.findOne({ where: { session_id: newSession.session_id } }));

    await newSession.save();

    return new Promise((res, rej) => {
        const payload = { id, iat, kid: keyPair.fingerprint, ver: CurrentTokenFormatVersion, did: newSession.session_id } as UserTokenData["decoded"];
        jwt.sign(
            payload,
            keyPair.privateKey,
            {
                algorithm: "ES512",
            },
            (err, token) => {
                if (err) return rej(err);
                return res(token);
            },
        );
    });
}

export class JwtKeypairManager {
    private static isLocked = false;
    static #keypair?: JwtKeypair;
    static #filesystemCheckInterval: NodeJS.Timeout;

    public static get keypair() {
        if (!this.#keypair) throw new Error("JwtKeypairManager#keypair.get called before being initialized.");
        return this.#keypair;
    }

    // Get ECDSA keypair from file or generate it
    public static async init() {
        if (this.isLocked) {
            const lockSw = Stopwatch.startNew();
            while (this.isLocked) {
                await sleep(50);
                if (lockSw.elapsed().totalSeconds > 10) throw new Error("[JwtKeypairManager] Initialization was locked for >10 seconds!");
            }
        }

        this.isLocked = true;
        try {
            let privateKey: crypto.KeyObject;
            let publicKey: crypto.KeyObject;

            if (existsSync("jwt.key") && existsSync("jwt.key.pub")) {
                const [loadedPrivateKey, loadedPublicKey] = await Promise.all([fs.readFile("jwt.key"), fs.readFile("jwt.key.pub")]);

                privateKey = crypto.createPrivateKey(loadedPrivateKey);
                publicKey = crypto.createPublicKey(loadedPublicKey);
            } else {
                console.log("[JWT] Generating new keypair:", path.resolve("jwt.key"), "- PWD:", process.cwd());
                const res = crypto.generateKeyPairSync("ec", {
                    namedCurve: "secp521r1",
                });
                privateKey = res.privateKey;
                publicKey = res.publicKey;

                await Promise.all([
                    fs.writeFile("jwt.key", privateKey.export({ format: "pem", type: "sec1" })),
                    fs.writeFile("jwt.key.pub", publicKey.export({ format: "pem", type: "spki" })),
                ]);
            }

            const fingerprint = crypto
                .createHash("sha256")
                .update(publicKey.export({ format: "pem", type: "spki" }))
                .digest("hex");

            this.#keypair = new JwtKeypair(privateKey, publicKey, fingerprint);

            // set up interval to check if key was accidentally deleted
            this.#filesystemCheckInterval = setInterval(async () => this.runDeletionCheck(), 60_000);
            ProcessLifecycle.eventEmitter.on("stopped", async () => {
                clearInterval(this.#filesystemCheckInterval);
                await this.runDeletionCheck();
            });
        } catch (e) {
            console.error(`[JwtKeypairManager] Initialization failed:`, e);
        } finally {
            this.isLocked = false;
        }
    }

    private static async runDeletionCheck() {
        try {
            if (!existsSync("jwt.key") || !existsSync("jwt.key.pub")) {
                console.log("[JWT] Keypair files disappeared... Saving them again.");
                await Promise.all([
                    fs.writeFile("jwt.key", this.keypair.privateKey.export({ format: "pem", type: "sec1" })),
                    fs.writeFile("jwt.key.pub", this.keypair.publicKey.export({ format: "pem", type: "spki" })),
                ]);
            }
        } catch (e) {
            console.error("[JwtKeypairManager] Failed to check if keypair was accidentally deleted:", e);
        }
    }
}

class JwtKeypair {
    public readonly privateKey: KeyObject;
    public readonly publicKey: KeyObject;
    public readonly fingerprint: string;

    constructor(privateKey: KeyObject, publicKey: KeyObject, fingerprint: string) {
        this.privateKey = privateKey;
        this.publicKey = publicKey;
        this.fingerprint = fingerprint;
    }
}
