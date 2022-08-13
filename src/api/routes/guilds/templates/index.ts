import { Request, Response, Router } from "express";
import { Template, Guild, Role, Snowflake, Config, User, Member, DiscordApiErrors, OrmUtils, GuildTemplateCreateSchema } from "@fosscord/util";
import { route } from "@fosscord/api";
import fetch from "node-fetch";
const router: Router = Router();

router.get("/:code", route({}), async (req: Request, res: Response) => {
	const { allowDiscordTemplates, allowRaws, enabled } = Config.get().templates;
	if (!enabled) res.json({ code: 403, message: "Template creation & usage is disabled on this instance." }).sendStatus(403);

	const { code } = req.params;
	
	if (code.startsWith("discord:")) {
		if (!allowDiscordTemplates)	return res.json({ code: 403, message: "Discord templates cannot be used on this instance." }).sendStatus(403);
		const discordTemplateID = code.split("discord:", 2)[1];

		const discordTemplateData = await fetch(`https://discord.com/api/v9/guilds/templates/${discordTemplateID}`, {
			method: "get",
			headers: { "Content-Type": "application/json" }
		});
		return res.json(await discordTemplateData.json());
	}

	if (code.startsWith("external:")) {
		if (!allowRaws)	return res.json({ code: 403, message: "Importing raws is disabled on this instance." }).sendStatus(403);

		return res.json(code.split("external:", 2)[1]);
	}

	const template = await Template.findOneOrFail({ where: { code } });
	res.json(template);
});

router.post("/:code", route({ body: "GuildTemplateCreateSchema" }), async (req: Request, res: Response) => {
	const { enabled, allowTemplateCreation, allowDiscordTemplates, allowRaws } = Config.get().templates;
	if (!enabled) return res.json({ code: 403, message: "Template creation & usage is disabled on this instance." }).sendStatus(403);
	if (!allowTemplateCreation) return res.json({ code: 403, message: "Template creation is disabled on this instance." }).sendStatus(403);

	const { code } = req.params;
	const body = req.body as GuildTemplateCreateSchema;

	const { maxGuilds } = Config.get().limits.user;

	const guild_count = await Member.count({ where: { id: req.user_id } });
	if (guild_count >= maxGuilds) {
		throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
	}

	const template = await Template.findOneOrFail({ where: { code } });

	const guild_id = Snowflake.generate();

	const [guild, role] = await Promise.all([
		OrmUtils.mergeDeep(new Guild(), {
			...body,
			...template.serialized_source_guild,
			id: guild_id,
			owner_id: req.user_id
		}).save(),
		(OrmUtils.mergeDeep(new Role(), {
			id: guild_id,
			guild_id: guild_id,
			color: 0,
			hoist: false,
			managed: true,
			mentionable: true,
			name: "@everyone",
			permissions: BigInt("2251804225"),
			position: 0,
			tags: null
		}) as Role).save()
	]);

	await Member.addToGuild(req.user_id, guild_id);

	res.status(201).json({ id: guild.id });
});

export default router;
