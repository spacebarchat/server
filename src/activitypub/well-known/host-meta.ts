import { route } from "@spacebar/api";
import { Config } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router();
export default router;

router.get("/", route({}), async (req: Request, res: Response) => {
	res.setHeader("Content-Type", "application/xrd+xml");

	const { webDomain } = Config.get().federation;

	const ret = `<?xml version="1.0" encoding="UTF-8"?>
	<XRD
		xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
		<Link rel="lrdd" type="application/xrd+xml" template="https://${webDomain}/.well-known/webfinger?resource={uri}"/>
	</XRD>`;

	return res.send(ret);
});
