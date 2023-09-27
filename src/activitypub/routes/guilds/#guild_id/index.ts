import { transformGuildToOrganisation } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Guild } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

// TODO: auth
router.get("/", route({}), async (req: Request, res: Response) => {
	const guild = await Guild.findOneOrFail({
		where: { id: req.params.guild_id },
	});

	return res.json(await transformGuildToOrganisation(guild));
});

export default router;
