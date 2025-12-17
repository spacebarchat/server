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

import jwt, { VerifyOptions } from "jsonwebtoken";
import { Config } from "./Config";
import { InstanceBan, Session, User } from "../entities";
import crypto from "node:crypto";
import fs from "fs/promises";
import { existsSync } from "fs";
// TODO: dont use deprecated APIs lol
import { FindManyOptions, FindOptions, FindOptionsRelationByString, FindOptionsSelect, FindOptionsSelectByString, FindOptionsWhere } from "typeorm";
import * as console from "node:console";
import { randomUpperString } from "@spacebar/api";
import { IpDataClient } from "./networking";
import { TimeSpan } from "./Timespan";
import { EnvConfig } from "../config";

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
		ver?: number; // token format version
		did?: string; // device id
	};
};

function logAuth(text: string) {
	if (!EnvConfig.get().logging.logAuthentication) return;
	console.log(`[AUTH] ${text}`);
}

function rejectAndLog(rejectFunction: (reason?: string) => void, reason: string) {
	console.error(reason);
	rejectFunction(reason);
}

export const checkToken = (
	token: string,
	opts?: {
		select?: FindOptionsSelectByString<User>;
		relations?: FindOptionsRelationByString;
		ipAddress?: string;
		fingerprint?: string;
	},
): Promise<UserTokenData> => {
	return new Promise((resolve, reject) => {
		token = token.replace("Bot ", ""); // there is no bot distinction in sb
		token = token.replace("Bearer ", ""); // allow bearer tokens

		let legacyVersion: number | undefined = undefined;

		const validateUser: jwt.VerifyCallback = async (err, out) => {
			const decoded = out as UserTokenData["decoded"];
			if (err || !decoded) {
				logAuth("validateUser rejected: " + err);
				return rejectAndLog(reject, "Invalid Token meow " + err);
			}

			const [user, session] = await Promise.all([
				User.findOne({
					where: { id: decoded.id },
					select: [...(opts?.select || []), "id", "bot", "disabled", "deleted", "rights", "data"],
					relations: opts?.relations,
				}),
				decoded.did ? Session.findOne({ where: { session_id: decoded.did, user_id: decoded.id } }) : undefined,
			]);

			if (!user) {
				logAuth("validateUser rejected: User not found");
				return rejectAndLog(reject, "User not found");
			}

			if (decoded.did && !session) {
				logAuth("validateUser rejected: Session not found");
				return rejectAndLog(reject, "Invalid Token");
			}

			// we need to round it to seconds as it saved as seconds in jwt iat and valid_tokens_since is stored in milliseconds
			if (decoded.iat * 1000 < new Date(user.data.valid_tokens_since).setSeconds(0, 0)) {
				logAuth("validateUser rejected: Token not yet valid");
				return rejectAndLog(reject, "Invalid Token");
			}

			if (user.disabled) {
				logAuth("validateUser rejected: User disabled");
				return rejectAndLog(reject, "User disabled");
			}

			if (user.deleted) {
				logAuth("validateUser rejected: User deleted");
				return rejectAndLog(reject, "User not found");
			}

			const banReasons = await InstanceBan.findInstanceBans({ userId: user.id, ipAddress: opts?.ipAddress, fingerprint: opts?.fingerprint, propagateBan: true });
			if (banReasons.length > 0) {
				logAuth("validateUser rejected: User banned for reasons: " + banReasons.join(", "));
				return rejectAndLog(reject, "Invalid Token");
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
		if (!dec) return reject("Could not parse token");
		logAuth("Decoded token: " + JSON.stringify(dec));

		if (dec.header.alg == "HS256" && Config.get().security.jwtSecret !== null) {
			legacyVersion = 1;
			jwt.verify(token, Config.get().security.jwtSecret!, { algorithms: ["HS256"] }, validateUser);
		} else if (dec.header.alg == "ES512") {
			loadOrGenerateKeypair().then((keyPair) => {
				jwt.verify(token, keyPair.publicKey, { algorithms: ["ES512"] }, validateUser);
			});
		} else return reject("Invalid token algorithm");
	});
};

export async function generateToken(id: string, isAdminSession: boolean = false): Promise<string | undefined> {
	const iat = Math.floor(Date.now() / 1000);
	const keyPair = await loadOrGenerateKeypair();

	let newSession;
	do {
		newSession = Session.create({
			session_id: randomUpperString(10), // readable at a glance
			user_id: id,
			is_admin_session: isAdminSession,
			client_status: {},
			status: "online",
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

let lastFsCheck: number;
let cachedKeypair: {
	privateKey: crypto.KeyObject;
	publicKey: crypto.KeyObject;
	fingerprint: string;
};

// Get ECDSA keypair from file or generate it
export async function loadOrGenerateKeypair() {
	if (cachedKeypair) {
		// check for file deletion every minute
		if (Date.now() - lastFsCheck > 60000) {
			if (!existsSync("jwt.key") || !existsSync("jwt.key.pub")) {
				console.log("[JWT] Keypair files disappeared... Saving them again.");
				await Promise.all([
					fs.writeFile("jwt.key", cachedKeypair.privateKey.export({ format: "pem", type: "sec1" })),
					fs.writeFile("jwt.key.pub", cachedKeypair.publicKey.export({ format: "pem", type: "spki" })),
				]);
			}
			lastFsCheck = Date.now();
		}

		return cachedKeypair;
	}

	let privateKey: crypto.KeyObject;
	let publicKey: crypto.KeyObject;

	if (existsSync("jwt.key") && existsSync("jwt.key.pub")) {
		const [loadedPrivateKey, loadedPublicKey] = await Promise.all([fs.readFile("jwt.key"), fs.readFile("jwt.key.pub")]);

		privateKey = crypto.createPrivateKey(loadedPrivateKey);
		publicKey = crypto.createPublicKey(loadedPublicKey);
	} else {
		console.log("[JWT] Generating new keypair");
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

	lastFsCheck = Date.now();
	return (cachedKeypair = { privateKey, publicKey, fingerprint });
}
