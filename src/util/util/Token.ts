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

import jwt, { VerifyOptions } from "jsonwebtoken";
import { Config } from "./Config";
import { User } from "../entities";

export const JWTOptions: VerifyOptions = { algorithms: ["HS256"] };

export type UserTokenData = {
	user: User;
	decoded: { id: string; iat: number };
};

export function checkToken(
	token: string,
	jwtSecret: string,
): Promise<UserTokenData> {
	return new Promise((res, rej) => {
		token = token.replace("Bot ", "");
		token = token.replace("Bearer ", "");
		/**
		in fosscord, even with instances that have bot distinction; we won't enforce "Bot" prefix,
		as we don't really have separate pathways for bots 
		**/

		jwt.verify(token, jwtSecret, JWTOptions, async (err, decoded) => {
			if (err || !decoded) return rej("Invalid Token");
			if (
				typeof decoded == "string" ||
				!("id" in decoded) ||
				!decoded.iat
			)
				return rej("Invalid Token"); // will never happen, just for typings.

			const user = await User.findOne({
				where: { id: decoded.id },
				select: ["data", "bot", "disabled", "deleted", "rights"],
			});

			if (!user) return rej("Invalid Token");

			// we need to round it to seconds as it saved as seconds in jwt iat and valid_tokens_since is stored in milliseconds
			if (
				decoded.iat * 1000 <
				new Date(user.data.valid_tokens_since).setSeconds(0, 0)
			)
				return rej("Invalid Token");

			if (user.disabled) return rej("User disabled");
			if (user.deleted) return rej("User not found");

			// Using as here because we assert `id` and `iat` are in decoded.
			// TS just doesn't want to assume its there, though.
			return res({ decoded, user } as UserTokenData);
		});
	});
}

/**
 * Puyodead1 (1/19/2023): I made a copy of this function because I didn't want to break anything with the other one.
 * this version of the function doesn't use select, so we can update the user. with select causes constraint errors.
 */
export function verifyTokenEmailVerification(
	token: string,
	jwtSecret: string,
): Promise<{ decoded: any; user: User }> {
	return new Promise((res, rej) => {
		jwt.verify(token, jwtSecret, JWTOptions, async (err, decoded: any) => {
			if (err || !decoded) return rej("Invalid Token");

			const user = await User.findOne({
				where: { id: decoded.id },
			});
			if (!user) return rej("Invalid Token");
			if (user.disabled) return rej("User disabled");
			if (user.deleted) return rej("User not found");

			return res({ decoded, user });
		});
	});
}

export function verifyToken(
	token: string,
	jwtSecret: string,
): Promise<{ decoded: any; user: User }> {
	return new Promise((res, rej) => {
		jwt.verify(token, jwtSecret, JWTOptions, async (err, decoded: any) => {
			if (err || !decoded) return rej("Invalid Token");

			const user = await User.findOne({
				where: { id: decoded.id },
				select: ["data", "bot", "disabled", "deleted", "rights"],
			});
			if (!user) return rej("Invalid Token");
			if (user.disabled) return rej("User disabled");
			if (user.deleted) return rej("User not found");

			return res({ decoded, user });
		});
	});
}

export async function generateToken(id: string, email?: string) {
	const iat = Math.floor(Date.now() / 1000);
	const algorithm = "HS256";

	return new Promise((res, rej) => {
		jwt.sign(
			{ id: id, email: email, iat },
			Config.get().security.jwtSecret,
			{
				algorithm,
			},
			(err, token) => {
				if (err) return rej(err);
				return res(token);
			},
		);
	});
}
