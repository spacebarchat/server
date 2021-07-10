import { Request, Response, Router } from "express";
const router: Router = Router();
import { TemplateModel, GuildModel, toObject, UserModel, RoleModel, Snowflake, Guild, Config } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { GuildTemplateCreateSchema } from "../../../schema/Guild";
import { getPublicUser } from "../../../util/User";
import { check } from "../../../util/instanceOf";
import { addMember } from "../../../util/Member";

router.get("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;

	const template = await TemplateModel.findOne({ id: code }).exec();

	res.json(toObject(template)).send();
});

router.post("/:code", check(GuildTemplateCreateSchema), async (req: Request, res: Response) => {
	const { code } = req.params;
	const body = req.body as GuildTemplateCreateSchema;

	const { maxGuilds } = Config.get().limits.user;
	const user = await getPublicUser(req.user_id, { guilds: true });

	if (user.guilds.length >= maxGuilds) {
		throw new HTTPError(`Maximum number of guilds reached ${maxGuilds}`, 403);
	}

	const template = await TemplateModel.findOne({ code: code }).exec();

	const guild_id = Snowflake.generate();

	const guild: Guild = {
		...body,
		...template.serialized_source_guild,
		id: guild_id,
		owner_id: req.user_id
	};

	const [guild_doc, role] = await Promise.all([
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
			tags: null
		}).save()
	]);

	await addMember(req.user_id, guild_id, { guild: guild_doc });

	res.status(201).json({ id: guild.id });
});

export default router;
