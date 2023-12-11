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
import { User } from "../entities";
// TODO: dont use deprecated APIs lol
import { FindOptionsRelationByString, FindOptionsSelectByString } from "typeorm";

export const JWTOptions: VerifyOptions = { algorithms: ["HS256"] };

export type UserTokenData = {
	user: User;
	decoded: { id: string; iat: number; email?: string };
};

export const checkToken = (
	token: string,
	opts?: {
		select?: FindOptionsSelectByString<User>;
		relations?: FindOptionsRelationByString;
	}
): Promise<UserTokenData> =>
	new Promise((resolve, reject) => {
		token = token.replace("Bot ", ""); // there is no bot distinction in sb
		token = token.replace("Bearer ", ""); // allow bearer tokens

		jwt.verify(token, Config.get().security.jwtSecret, JWTOptions, async (err, out) => {
			const decoded = out as UserTokenData["decoded"];
			if (err || !decoded) return reject("Invalid Token");

			const user = await User.findOne({
				where: decoded.email ? { email: decoded.email } : { id: decoded.id },
				select: [...(opts?.select || []), "bot", "disabled", "deleted", "rights", "data"],
				relations: opts?.relations,
			});

			if (!user) return reject("User not found");

			// we need to round it to seconds as it saved as seconds in jwt iat and valid_tokens_since is stored in milliseconds
			if (decoded.iat * 1000 < new Date(user.data.valid_tokens_since).setSeconds(0, 0))
				return reject("Invalid Token");

			if (user.disabled) return reject("User disabled");
			if (user.deleted) return reject("User not found");

			return resolve({ decoded, user });
		});
	});

export async function generateToken(id: string, email?: string) {
	const iat = Math.floor(Date.now() / 1000);
	const algorithm = "HS256";

	return new Promise((res, rej) => {
		jwt.sign(
			{ id, iat, email },
			Config.get().security.jwtSecret,
			{
				algorithm,
			},
			(err, token) => {
				if (err) return rej(err);
				return res(token);
			}
		);
	});
}
