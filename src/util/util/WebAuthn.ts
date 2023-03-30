/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
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

import { Fido2Lib } from "fido2-lib";
import jwt from "jsonwebtoken";
import { Config } from "./Config";

const JWTOptions: jwt.SignOptions = {
	algorithm: "HS256",
	expiresIn: "5m",
};

export const WebAuthn: {
	fido2: Fido2Lib | null;
	init: () => void;
} = {
	fido2: null,
	init: function () {
		this.fido2 = new Fido2Lib({
			challengeSize: 128,
		});
	},
};

export async function generateWebAuthnTicket(
	challenge: string,
): Promise<string> {
	return new Promise((res, rej) => {
		jwt.sign(
			{ challenge },
			Config.get().security.jwtSecret,
			JWTOptions,
			(err, token) => {
				if (err || !token) return rej(err || "no token");
				return res(token);
			},
		);
	});
}

export async function verifyWebAuthnToken(token: string) {
	return new Promise((res, rej) => {
		jwt.verify(
			token,
			Config.get().security.jwtSecret,
			JWTOptions,
			async (err, decoded) => {
				if (err) return rej(err);
				return res(decoded);
			},
		);
	});
}
