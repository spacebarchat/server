import { Config } from "@fosscord/util";
import { Router, Response, Request } from "express";
import { route, RouteOptions } from "@fosscord/api";

const router = Router();

export interface GatewayBotResponse {
	url: string;
	shards: number;
	session_start_limit: {
		total: number;
		remaining: number;
		reset_after: number;
		max_concurrency: number;
	};
}

const options: RouteOptions = {
	test: {
		response: {
			body: "GatewayBotResponse"
		}
	}
};

router.get("/", route(options), (req: Request, res: Response) => {
	const { endpointPublic } = Config.get().gateway;
	res.json({
		url: endpointPublic || process.env.GATEWAY || "ws://localhost:3002",
		shards: 1,
		session_start_limit: {
			total: 1000,
			remaining: 999,
			reset_after: 14400000,
			max_concurrency: 1
		}
	});
});

export default router;
