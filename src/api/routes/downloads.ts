import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { Release, Config } from "@fosscord/util";

const router = Router();

router.get("/:branch", route({}), async (req: Request, res: Response) => {
	const { client } = Config.get();
	const { branch } = req.params;
	const { platform } = req.query;
	//TODO

	if (!platform || !["linux", "osx", "win"].includes(platform.toString())) return res.status(404);

	const release = await Release.findOneOrFail({ where: { name: client.releases.upstreamVersion } });

	res.redirect(release[`win_url`]);
});

export default router;
