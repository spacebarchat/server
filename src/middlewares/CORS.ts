import { NextFunction, Request, Response } from "express";

// TODO: config settings

export function CORS(req: Request, res: Response, next: NextFunction) {
	res.set("Access-Control-Allow-Origin", "*");
}
