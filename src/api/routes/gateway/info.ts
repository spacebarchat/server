import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { Config } from "@fosscord/util";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	const { api, cdn, gateway } = Config.get();
	res.send({
		endpoints: {
			defaultApiVersion: api.defaultVersion ?? 9,
			apiEndpoint: api.endpointPublic ?? "/api",
			cdnEndpoint: cdn.endpointPublic ?? "/",
			gatewayEndpoint: gateway.endpointPublic ?? "ws://localhost:3001",
		},
	});
});

export default router;
