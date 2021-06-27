import { db, MongooseCache } from "@fosscord/server-util";
import { NextFunction } from "express";

const Cache = new MongooseCache(db.collection("ratelimit"), [], { onlyEvents: false });

export default function RateLimit({}) {
	return async (req: Request, res: Response, next: NextFunction) => {};
}
