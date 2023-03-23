/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { route } from "@fosscord/api";
import {
	generateToken,
	SecurityKey,
	User,
	verifyWebAuthnToken,
	WebAuthn,
	WebAuthnTotpSchema,
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import { ExpectedAssertionResult } from "fido2-lib";
import { HTTPError } from "lambert-server";
const router = Router();

function toArrayBuffer(buf: Buffer) {
	const ab = new ArrayBuffer(buf.length);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; ++i) {
		view[i] = buf[i];
	}
	return ab;
}

router.post(
	"/",
	route({
		body: "WebAuthnTotpSchema",
		responses: {
			200: { body: "TokenResponse" },
			400: { body: "APIErrorResponse" },
		},
	}),
	async (req: Request, res: Response) => {
		if (!WebAuthn.fido2) {
			// TODO: I did this for typescript and I can't use !
			throw new Error("WebAuthn not enabled");
		}

		const { code, ticket } = req.body as WebAuthnTotpSchema;

		const user = await User.findOneOrFail({
			where: {
				totp_last_ticket: ticket,
			},
			select: ["id"],
			relations: ["settings"],
		});

		const ret = await verifyWebAuthnToken(ticket);
		if (!ret)
			throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

		await User.update({ id: user.id }, { totp_last_ticket: "" });

		const clientAttestationResponse = JSON.parse(code);

		if (!clientAttestationResponse.rawId)
			throw new HTTPError("Missing rawId", 400);

		clientAttestationResponse.rawId = toArrayBuffer(
			Buffer.from(clientAttestationResponse.rawId, "base64url"),
		);

		const securityKey = await SecurityKey.findOneOrFail({
			where: {
				key_id: Buffer.from(
					clientAttestationResponse.rawId,
					"base64url",
				).toString("base64"),
			},
		});

		const assertionExpectations: ExpectedAssertionResult = JSON.parse(
			Buffer.from(
				clientAttestationResponse.response.clientDataJSON,
				"base64",
			).toString(),
		);

		const authnResult = await WebAuthn.fido2.assertionResult(
			clientAttestationResponse,
			{
				...assertionExpectations,
				factor: "second",
				publicKey: securityKey.public_key,
				prevCounter: securityKey.counter,
				userHandle: securityKey.key_id,
			},
		);

		const counter = authnResult.authnrData.get("counter");

		securityKey.counter = counter;

		await securityKey.save();

		return res.json({
			token: await generateToken(user.id),
			user_settings: user.settings,
		});
	},
);

export default router;
