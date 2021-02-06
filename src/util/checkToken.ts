import { JWTOptions } from "./Constants";
import jwt from "jsonwebtoken";
import Config from "./Config";

export function checkToken(token: string): Promise<any> {
	return new Promise((res, rej) => {
		jwt.verify(token, Config.getAll().api.security.jwtSecret, JWTOptions, (err, decoded: any) => {
			if (err || !decoded) return rej("Invalid Token");

			return res(decoded);
		});
	});
}
