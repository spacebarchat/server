import { route } from "@fosscord/api";
import { Config, DiscordApiErrors, getRights, Guild, GuildCreateSchema, Member } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

//TODO: create default channel

router.post("/", route({ body: "GuildCreateSchema", right: "CREATE_GUILDS" }), async (req: Request, res: Response) => {
	let cfg = Config.get();
	const body = req.body as GuildCreateSchema;

	const { maxGuilds } = cfg.limits.user;
	const guild_count = await Member.count({ where: { id: req.user_id } });
	const rights = await getRights(req.user_id);
	if (guild_count >= maxGuilds && !rights.has("MANAGE_GUILDS")) {
		throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
	}

	const guild = await Guild.createGuild({ ...body, owner_id: req.user_id });

	const { autoJoin } = cfg.guild;
	if (autoJoin.enabled && !autoJoin.guilds?.length) {
		// @ts-ignore
		await Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
	}

	await Member.addToGuild(req.user_id, guild.id);

	res.status(201).json({ id: guild.id });
});

export default router;
