import { JWTOptions } from "./Constants";
import jwt from "jsonwebtoken";

export function checkToken(token: string, jwtSecret: string): Promise<any> {
	return new Promise((res, rej) => {
		jwt.verify(token, jwtSecret, JWTOptions, (err, decoded: any) => {
			if (err || !decoded) return rej("Invalid Token");

			return res(decoded);
		});
	});
}
