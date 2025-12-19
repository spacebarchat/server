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

import { route } from "@spacebar/api";
import { DiscordApiErrors, FieldErrors, generateWebAuthnTicket, SecurityKey, User, verifyWebAuthnToken, WebAuthn } from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { ExpectedAttestationResult } from "fido2-lib";
import { HTTPError } from "lambert-server";
import { CreateWebAuthnCredentialSchema, GenerateWebAuthnCredentialsSchema, WebAuthnPostSchema } from "@spacebar/schemas";
const router = Router({ mergeParams: true });

const isGenerateSchema = (body: WebAuthnPostSchema): body is GenerateWebAuthnCredentialsSchema => {
    return "password" in body;
};

const isCreateSchema = (body: WebAuthnPostSchema): body is CreateWebAuthnCredentialSchema => {
    return "credential" in body;
};

function toArrayBuffer(buf: Buffer) {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

router.get("/", route({}), async (req: Request, res: Response) => {
    const securityKeys = await SecurityKey.find({
        where: {
            user_id: req.user_id,
        },
    });

    return res.json(
        securityKeys.map((key) => ({
            id: key.id,
            name: key.name,
        })),
    );
});

router.post(
    "/",
    route({
        requestBody: "WebAuthnPostSchema",
        responses: {
            200: {
                body: "WebAuthnCreateResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        if (!WebAuthn.fido2) {
            // TODO: I did this for typescript and I can't use !
            throw new Error("WebAuthn not enabled");
        }

        const user = await User.findOneOrFail({
            where: {
                id: req.user_id,
            },
            select: { data: true, id: true, disabled: true, deleted: true, totp_secret: true, mfa_enabled: true, username: true },
            relations: { settings: true },
        });

        if (isGenerateSchema(req.body)) {
            const { password } = req.body;
            const same_password = await bcrypt.compare(password, user.data.hash || "");
            if (!same_password) {
                throw FieldErrors({
                    password: {
                        message: req.t("auth:login.INVALID_PASSWORD"),
                        code: "INVALID_PASSWORD",
                    },
                });
            }

            const registrationOptions = await WebAuthn.fido2.attestationOptions();
            const challenge = JSON.stringify({
                publicKey: {
                    ...registrationOptions,
                    challenge: Buffer.from(registrationOptions.challenge).toString("base64"),
                    user: {
                        id: user.id,
                        name: user.username,
                        displayName: user.username,
                    },
                },
            });

            const ticket = await generateWebAuthnTicket(challenge);

            return res.json({
                ticket: ticket,
                challenge,
            });
        } else if (isCreateSchema(req.body)) {
            const { credential, name, ticket } = req.body;

            const verified = await verifyWebAuthnToken(ticket);
            if (!verified) throw new HTTPError("Invalid ticket", 400);

            const clientAttestationResponse = JSON.parse(credential);

            if (!clientAttestationResponse.rawId) throw new HTTPError("Missing rawId", 400);

            const rawIdBuffer = Buffer.from(clientAttestationResponse.rawId, "base64");
            clientAttestationResponse.rawId = toArrayBuffer(rawIdBuffer);

            const attestationExpectations: ExpectedAttestationResult = JSON.parse(Buffer.from(clientAttestationResponse.response.clientDataJSON, "base64").toString());

            const regResult = await WebAuthn.fido2.attestationResult(clientAttestationResponse, {
                ...attestationExpectations,
                factor: "second",
            });

            const authnrData = regResult.authnrData;
            const keyId = Buffer.from(authnrData.get("credId")).toString("base64");
            const counter = authnrData.get("counter");
            const publicKey = authnrData.get("credentialPublicKeyPem");

            const securityKey = SecurityKey.create({
                name,
                counter,
                public_key: publicKey,
                user_id: req.user_id,
                key_id: keyId,
            });

            await Promise.all([securityKey.save(), User.update({ id: req.user_id }, { webauthn_enabled: true })]);

            return res.json({
                name,
                id: securityKey.id,
            });
        } else {
            throw DiscordApiErrors.INVALID_AUTHENTICATION_TOKEN;
        }
    },
);

export default router;
