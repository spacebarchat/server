import { Router, Request, Response } from "express";
import { Role, Guild, Snowflake, Config, Member, Channel, DiscordApiErrors, handleFile } from "@fosscord/util";
import { route } from "@fosscord/api";
import { ChannelModifySchema } from "../channels/#channel_id";

const router: Router = Router();

export interface GuildCreateSchema {
	/**
	 * @maxLength 100
	 */
	name: string;
	region?: string;
	icon?: string | null;
	channels?: ChannelModifySchema[];
	guild_template_code?: string;
	system_channel_id?: string;
	rules_channel_id?: string;
}

//TODO: create default channel

router.post("/", route({ body: "GuildCreateSchema" }), async (req: Request, res: Response) => {
	const body = req.body as GuildCreateSchema;

	const { maxGuilds } = Config.get().limits.user;
	const guild_count = await Member.count({ id: req.user_id });
	if (guild_count >= maxGuilds) {
		throw DiscordApiErrors.MAXIMUM_GUILDS.withParams(maxGuilds);
	}

	const guild = await Guild.createGuild({ ...body, owner_id: req.user_id });

	const { autoJoin } = Config.get().guild;
	if (autoJoin.enabled && !autoJoin.guilds?.length) {
		// @ts-ignore
		await Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
	}

	await Member.addToGuild(req.user_id, guild.id);

	res.status(201).json({ id: guild.id });
});

export default router;
