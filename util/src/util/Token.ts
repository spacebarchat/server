import jwt, { VerifyOptions } from "jsonwebtoken";
import { Config } from "./Config";
import { User } from "../entities";

export const JWTOptions: VerifyOptions = { algorithms: ["HS256"] };

export function checkToken(token: string, jwtSecret: string): Promise<any> {
	return new Promise((res, rej) => {
		token = token.replace("Bot ", ""); // TODO: proper bot support
		jwt.verify(token, jwtSecret, JWTOptions, async (err, decoded: any) => {
			if (err || !decoded) return rej("Invalid Token");

			const user = await User.findOne(
				{ id: decoded.id },
				{ select: ["data", "bot", "disabled", "deleted", "rights"] }
			);
			if (!user) return rej("Invalid Token");
			// we need to round it to seconds as it saved as seconds in jwt iat and valid_tokens_since is stored in milliseconds
			if (decoded.iat * 1000 < new Date(user.data.valid_tokens_since).setSeconds(0, 0))
				return rej("Invalid Token");
			if (user.disabled) return rej("User disabled");
			if (user.deleted) return rej("User not found");

			return res({ decoded, user });
		});
	});
}

export async function generateToken(id: string) {
	const iat = Math.floor(Date.now() / 1000);
	const algorithm = "HS256";

	return new Promise((res, rej) => {
		jwt.sign(
			{ id: id, iat },
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
