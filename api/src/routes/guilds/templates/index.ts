import { Request, Response, Router } from "express";
const router: Router = Router();
import { Template, Guild, Role, Snowflake, Config, User, Member } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { GuildTemplateCreateSchema } from "../../../schema/Guild";
import { check } from "../../../util/instanceOf";
import { DiscordApiErrors } from "../../../util/Constants";

router.get("/:code", async (req: Request, res: Response) => {
	const { code } = req.params;

	const template = await Template.findOneOrFail({ code: code });

	res.json(template);
});

router.post("/:code", check(GuildTemplateCreateSchema), async (req: Request, res: Response) => {
	const { code } = req.params;
	const body = req.body as GuildTemplateCreateSchema;

	const { maxGuilds } = Config.get().limits.user;

	const guild_count = await Member.count({ user_id: req.user_id });
	if (guild_count >= maxGuilds) {
		throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
	}

	const template = await Template.findOneOrFail({ code: code });

	const guild_id = Snowflake.generate();

	const [guild, role] = await Promise.all([
		new Guild({
			...body,
			...template.serialized_source_guild,
			id: guild_id,
			owner_id: req.user_id
		}).save(),
		new Role({
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

	await Member.addToGuild(req.user_id, guild_id);

	res.status(201).json({ id: guild.id });
});

export default router;
