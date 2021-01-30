import { NextFunction, Request, Response } from "express";
import db from "../util/Database";
import { getIpAdress } from "./GlobalRateLimit";

export function RateLimit({ count = 10, timespan = 1000 * 5, name = "/" }) {
	return async (req: Request, res: Response, next: NextFunction) => {
		let id = req.userid || getIpAdress(req); // TODO: .replaceAll(".", "_"); // for ip adress replace all dots to save in database

		const limit: { count: number; start: number } = (await db.data.ratelimit.routes[name][id].get()) || {
			count: 0,
			start: Date.now(),
		};

		if (limit.start < Date.now() - timespan) {
			limit.start = Date.now();
			limit.count = 0;
		}

		if (limit.count > count) {
			const wait = Date.now() - limit.start;

			return res
				.set("Retry-After", `${wait.toFixed(0)}`)
				.set("X-RateLimit-Limit", `${count}`)
				.set("X-RateLimit-Remaining", "0")
				.set("X-RateLimit-Reset", `${limit.start + wait}`)
				.set("X-RateLimit-Reset-After", `${wait}`)
				.set("X-RateLimit-Bucket", name)
				.set("X-RateLimit-Global", "false")
				.status(429)
				.json({
					message: "You are being rate limited.",
					retry_after: wait,
					global: false,
				});
		}

		return next();
	};
}
