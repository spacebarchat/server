import { Request, Response, Router } from "express";
import { TemplateModel, Guild, getPermission, toObject, User, Snowflake } from "@fosscord/util";
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

	var templates = await Template.find({ source_guild_id: guild_id });

	return res.json(templates);
});

router.post("/", check(TemplateCreateSchema), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await Guild.findOneOrFail({ id: guild_id }, TemplateGuildProjection);
	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const exists = await Template.findOneOrFail({ id: guild_id }).catch((e) => {});
	if (exists) throw new HTTPError("Template already exists", 400);

	const template = await new TemplateModel({
		...req.body,
		code: generateCode(),
		creator_id: req.user_id,
		created_at: new Date(),
		updated_at: new Date(),
		source_guild_id: guild_id,
		serialized_source_guild: guild
	}).save();

	res.json(template)).send(;
});

router.delete("/:code", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const { code } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await Template.findOneOrFailAndDelete({
		code
	});

	res.send(template);
});

router.put("/:code", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const { code } = req.params;

	const guild = await Guild.findOneOrFail({ id: guild_id }, TemplateGuildProjection);

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await Template.findOneOrFailAndUpdate({ code }, { serialized_source_guild: guild }, { new: true });

	res.json(template)).send(;
});

router.patch("/:code", check(TemplateModifySchema), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const { code } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await Template.findOneOrFailAndUpdate({ code }, { name: req.body.name, description: req.body.description }, { new: true });

	res.json(template)).send(;
});

export default router;
