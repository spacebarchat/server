import { Config } from "@fosscord/util";
import { Router, Response, Request } from "express";
import { route, RouteOptions } from "@fosscord/api";

const router = Router();

export interface GatewayResponse {
	url: string;
}

const options: RouteOptions = {
	test: {
		response: {
			body: "GatewayResponse"
		}
	}
};

router.get("/", route(options), (req: Request, res: Response) => {
	const { endpointPublic } = Config.get().gateway;
	res.json({ url: endpointPublic || process.env.GATEWAY || "ws://localhost:3002" });
});

export default router;
