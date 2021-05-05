import { Request, Response, Router } from "express";
import { TemplateModel, GuildModel, getPermission, toObject, UserModel } from "@fosscord/server-util";
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

router.post("/", check(TemplateCreateSchema), async (req: Request, res: Response) => {

    const guild_id = req.params.guild_id;
    const { name } = req.body;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);
	if (!name) throw new HTTPError("Unknown name", 404);

	const user = await UserModel.findOne({ id: req.user_id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	/*const perms = await getPermission(req.user_id, guild_id);

	if (!perms.has("MANAGE_GUILD"))
		throw new HTTPError("You missing the MANAGE_GUILD permission", 401);*/

	var template = {
		...req.body,
		creator_id: req.user_id,
		creator: user,
		created_at: new Date(),
		updated_at: new Date(),
		source_guild_id: guild_id,
		serialized_source_guild: guild
	}

	const templatenew = await new TemplateModel(template).save();

	res.json(toObject(templatenew)).send();
});

router.delete("/:template_id", async (req: Request, res: Response) => {

    const guild_id = req.params.guild_id;
    const { template_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);
	if (!template_id) throw new HTTPError("Unknown template_id", 404);

	const user = await UserModel.findOne({ id: req.user_id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	const perms = await getPermission(req.user_id, guild_id);

	if (!perms.has("MANAGE_GUILD"))
		throw new HTTPError("You missing the MANAGE_GUILD permission", 401);

	await TemplateModel.findByIdAndDelete({
		_id: template_id,
		source_guild_id: guild_id
	}).exec();

	res.send("Deleted");
});

router.put("/:template_id", async (req: Request, res: Response) => {

    const guild_id = req.params.guild_id;
    const { template_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);
	if (!template_id) throw new HTTPError("Unknown template_id", 404);

	const user = await UserModel.findOne({ id: req.user_id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	const template = await TemplateModel.findById({ _id: template_id }).exec();
	if (!template) throw new HTTPError("template not found", 404);

	const perms = await getPermission(req.user_id, guild_id);

	if (!perms.has("MANAGE_GUILD"))
		throw new HTTPError("You missing the MANAGE_GUILD permission", 401);

	var templateobj = await TemplateModel.findByIdAndUpdate({
		_id: template_id,
		serialized_source_guild: guild
	}).exec();

	res.json(toObject(templateobj)).send();
});

export default router;
