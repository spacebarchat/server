import { Request, Response, Router } from "express";
import { TemplateModel, GuildModel, getPermission, toObject } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { TemplateCreateSchema } from "../../../schema/Template";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
import { getPublicUser } from "../../../util/User";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const guild_id = req.params.id;

	const guild = await GuildModel.exists({ id: guild_id });
	if (!guild) throw new HTTPError("Guild not found", 404);

	var templates = await TemplateModel.find({ source_guild_id: guild_id }).exec();
	return res.json(toObject(templates));
});


export default router;
