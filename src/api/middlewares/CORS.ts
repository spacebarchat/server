import { NextFunction, Request, Response } from "express";

// TODO: config settings

export function CORS(req: Request, res: Response, next: NextFunction) {
	res.set("Access-Control-Allow-Origin", "*");
	// TODO: use better CSP
	res.set(
		"Content-security-policy",
		"default-src *  data: blob: filesystem: about: ws: wss: 'unsafe-inline' 'unsafe-eval'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline';"
	);
	res.set("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers") || "*");
	res.set("Access-Control-Allow-Methods", req.header("Access-Control-Request-Methods") || "*");

	next();
}
