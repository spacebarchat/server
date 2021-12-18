import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { Relase, Config } from "@fosscord/util";

const router = Router();

router.get("/:branch", route({}), async (req: Request, res: Response) => {
	const { client } = Config.get();
	const { branch } = req.params;
	const { platform } = req.query;

	if(!platform || !["linux", "osx", "win"].includes(platform.toString())) return res.status(404)

	const relase = await Relase.findOneOrFail({ name: client.relases.upstreamVersion });

	res.redirect(relase[`win_url`]);
});

export default router;
