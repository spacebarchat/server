import { Request, Response, Router } from "express";
const router: Router = Router();
import { TemplateModel, GuildModel, toObject, UserModel, RoleModel, Snowflake, Guild } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { GuildTemplateCreateSchema } from "../../../schema/Guild";
import { getPublicUser } from "../../../util/User";
import { check } from "../../../util/instanceOf";
import Config from "../../../util/Config";
import { addMember } from "../../../util/Member";

router.get("/:template_id", async (req: Request, res: Response) => {

    const guild_id = req.params.guild_id;
    const { template_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);
	if (!template_id) throw new HTTPError("Unknown template_id", 404);

	const template = await TemplateModel.findOne({ id: template_id }).exec();
	if (!template) throw new HTTPError("template not found", 404);

	res.json(toObject(template)).send();
});

router.post("/:template_id", check(GuildTemplateCreateSchema), async (req: Request, res: Response) => {
    const { template_id } = req.params;
	const body = req.body as GuildTemplateCreateSchema;

	const { maxGuilds } = Config.get().limits.user;
	const user = await getPublicUser(req.user_id, { guilds: true });

	if (user.guilds.length >= maxGuilds) {
		throw new HTTPError(`Maximum number of guilds reached ${maxGuilds}`, 403);
	}

	if (!template_id) throw new HTTPError("Unknown template_id", 404);

	const template = await TemplateModel.findById({ _id: template_id }).exec();
	if (!template) throw new HTTPError("template not found", 404);

	const guild_id = Snowflake.generate();

	const guild: Guild = {
		...body,
		...template.serialized_source_guild,
		id: guild_id,
		owner_id: req.user_id
	};

	await Promise.all([
		new GuildModel(guild).save(),
		new RoleModel({
			id: guild_id,
			guild_id: guild_id,
			color: 0,
			hoist: false,
			managed: true,
			mentionable: true,
			name: "@everyone",
			permissions: 2251804225n,
			position: 0,
			tags: null,
		}).save(),
	]);
	await addMember(req.user_id, guild_id, { guild });

	res.status(201).json({ id: guild.id });
});


export default router;
