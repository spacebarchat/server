import { NextFunction, Request, Response } from "express";

// TODO: config settings

export function CORS(req: Request, res: Response, next: NextFunction) {
	res.set("Access-Control-Allow-Origin", "*");
	res.set(
		"Content-security-policy",
		"script-src 'https://hcaptcha.com, https://*.hcaptcha.com' frame-src 'https://hcaptcha.com, https://*.hcaptcha.com' style-src 'https://hcaptcha.com, https://*.hcaptcha.com' connect-src 'https://hcaptcha.com, https://*.hcaptcha.com'"
	);
	res.set("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));

	next();
}
