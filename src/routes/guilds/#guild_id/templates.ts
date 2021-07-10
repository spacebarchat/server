import { Request, Response, Router } from "express";
import { TemplateModel, GuildModel, getPermission, toObject, UserModel, Snowflake } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { TemplateCreateSchema, TemplateModifySchema } from "../../../schema/Template";
import { check } from "../../../util/instanceOf";
import { generateCode } from "../../../util/String";

const router: Router = Router();

const TemplateGuildProjection = {
	name: true,
	description: true,
	region: true,
	verification_level: true,
	default_message_notifications: true,
	explicit_content_filter: true,
	preferred_locale: true,
	afk_timeout: true,
	roles: true,
	channels: true,
	afk_channel_id: true,
	system_channel_id: true,
	system_channel_flags: true,
	icon_hash: true
};

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	var templates = await TemplateModel.find({ source_guild_id: guild_id }).exec();
	return res.json(toObject(templates));
});

router.post("/", check(TemplateCreateSchema), async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;

	const guild = await GuildModel.findOne({ id: guild_id }, TemplateGuildProjection).exec();

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await new TemplateModel({
		...req.body,
		code: generateCode(),
		creator_id: req.user_id,
		created_at: new Date(),
		updated_at: new Date(),
		source_guild_id: guild_id,
		serialized_source_guild: guild
	}).save();

	res.json(toObject(template)).send();
});

router.delete("/:code", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const { code } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await TemplateModel.findOneAndDelete({
		code
	}).exec();

	res.send(toObject(template));
});

router.put("/:code", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const { code } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, TemplateGuildProjection).exec();

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await TemplateModel.findOneAndUpdate({ code }, { serialized_source_guild: guild }).exec();

	res.json(toObject(template)).send();
});

router.patch("/:code", check(TemplateModifySchema), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const { code } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await TemplateModel.findOneAndUpdate({ code }, { name: req.body.name, description: req.body.description }).exec();

	res.json(toObject(template)).send();
});

export default router;
