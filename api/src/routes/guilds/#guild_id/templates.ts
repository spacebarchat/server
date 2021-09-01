import { Request, Response, Router } from "express";
import { Guild, getPermission, Template } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { TemplateCreateSchema, TemplateModifySchema } from "../../../schema/Template";
import { check } from "../../../util/instanceOf";
import { generateCode } from "../../../util/String";

const router: Router = Router();

const TemplateGuildProjection: (keyof Guild)[] = [
	"name",
	"description",
	"region",
	"verification_level",
	"default_message_notifications",
	"explicit_content_filter",
	"preferred_locale",
	"afk_timeout",
	"roles",
	// "channels",
	"afk_channel_id",
	"system_channel_id",
	"system_channel_flags",
	"icon"
];

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	var templates = await Template.find({ source_guild_id: guild_id });

	return res.json(templates);
});

router.post("/", check(TemplateCreateSchema), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await Guild.findOneOrFail({ where: { id: guild_id }, select: TemplateGuildProjection });
	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const exists = await Template.findOneOrFail({ id: guild_id }).catch((e) => {});
	if (exists) throw new HTTPError("Template already exists", 400);

	const template = await new Template({
		...req.body,
		code: generateCode(),
		creator_id: req.user_id,
		created_at: new Date(),
		updated_at: new Date(),
		source_guild_id: guild_id,
		serialized_source_guild: guild
	}).save();

	res.json(template);
});

router.delete("/:code", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const { code } = req.params;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await Template.delete({
		code
	});

	res.json(template);
});

router.put("/:code", async (req: Request, res: Response) => {
	// synchronizes the template
	const { code, guild_id } = req.params;

	const guild = await Guild.findOneOrFail({ where: { id: guild_id }, select: TemplateGuildProjection });

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await new Template({ code, serialized_source_guild: guild }).save();

	res.json(template);
});

router.patch("/:code", check(TemplateModifySchema), async (req: Request, res: Response) => {
	// updates the template description
	const { guild_id } = req.params;
	const { code } = req.params;
	const { name, description } = req.body;

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_GUILD");

	const template = await new Template({ code, name: name, description: description }).save();

	res.json(template);
});

export default router;
