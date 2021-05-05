import { Request, Response, Router } from "express";
const router: Router = Router();
import { TemplateModel, GuildModel, toObject, UserModel } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";

router.get("/:template_id", async (req: Request, res: Response) => {

    const guild_id = req.params.guild_id;
    const { template_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);
	if (!template_id) throw new HTTPError("Unknown template_id", 404);

	const template = await TemplateModel.findById({ _id: template_id }).exec();
	if (!template) throw new HTTPError("template not found", 404);

	res.json(toObject(template)).send();
});

export default router;
