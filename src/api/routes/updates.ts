import { route } from "@fosscord/api";
import { Config, Release } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { client } = Config.get();

	const release = await Release.findOneOrFail({ where: { name: client.releases.upstreamVersion } });

	res.json({
		name: release.name,
		pub_date: release.pub_date,
		url: release.url,
		notes: release.notes
	});
});

export default router;
