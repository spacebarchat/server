import { Request, Response, Router } from "express";
import { TemplateModel, GuildModel, getPermission, toObject, UserModel, Snowflake } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { TemplateCreateSchema, TemplateModifySchema } from "../../../schema/Template";
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

	const perms = await getPermission(req.user_id, guild_id);

	if (!perms.has("MANAGE_GUILD"))
		throw new HTTPError("You missing the MANAGE_GUILD permission", 401);

	const template_id = Snowflake.generate();

	var template = {
		...req.body,
		id: template_id,
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

	await TemplateModel.findOneAndDelete({
		id: template_id,
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

	const template = await TemplateModel.findOneAndDelete({ id: template_id }).exec();
	if (!template) throw new HTTPError("template not found", 404);

	const perms = await getPermission(req.user_id, guild_id);

	if (!perms.has("MANAGE_GUILD"))
		throw new HTTPError("You missing the MANAGE_GUILD permission", 401);

	var templateobj = await TemplateModel.findOneAndUpdate({
		id: template_id,
		serialized_source_guild: guild
	}).exec();

	res.json(toObject(templateobj)).send();
});

router.patch("/:template_id", check(TemplateModifySchema), async (req: Request, res: Response) => {
    const guild_id = req.params.guild_id;
    const { template_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);
	if (!template_id) throw new HTTPError("Unknown template_id", 404);

	const user = await UserModel.findOne({ id: req.user_id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	const template = await TemplateModel.findOne({ id: template_id }).exec();
	if (!template) throw new HTTPError("template not found", 404);

	const perms = await getPermission(req.user_id, guild_id);

	if (!perms.has("MANAGE_GUILD"))
		throw new HTTPError("You missing the MANAGE_GUILD permission", 401);

	var templateobj = await TemplateModel.findOneAndUpdate({
		id: template_id
	}, {name: req.body.name,
		description: req.body.description || "No description"}).exec();

	res.json(toObject(templateobj)).send();
});

export default router;
