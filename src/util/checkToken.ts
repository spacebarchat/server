import { JWTOptions } from "./Constants";
import jwt from "jsonwebtoken";
import { UserModel } from "../models";

export function checkToken(token: string, jwtSecret: string): Promise<any> {
	return new Promise((res, rej) => {
		jwt.verify(token, jwtSecret, JWTOptions, async (err, decoded: any) => {
			if (err || !decoded) return rej("Invalid Token");

			const user = await UserModel.findOne({ id: decoded.id }, { "user_data.valid_tokens_since": true }).exec();
			if (!user) return rej("User not found");
			if (decoded.iat * 1000 < user.user_data.valid_tokens_since.getTime()) return rej("Invalid Token");
			if (user.disabled) return rej("User disabled");
			if (user.deleted) return rej("User not found");

			return res(decoded);
		});
	});
}
