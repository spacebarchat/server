import { Request, Response, Router } from "express";
import {
	DiscordApiErrors,
	emitEvent,
	getPermission,
	getRights,
	Guild,
	GuildUpdateEvent,
	handleFile,
	Member,
	GuildUpdateSchema,
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	const [guild, member] = await Promise.all([
		Guild.findOneOrFail({ where: { id: guild_id } }),
		Member.findOne({ where: { guild_id: guild_id, id: req.user_id } }),
	]);
	if (!member)
		throw new HTTPError(
			"You are not a member of the guild you are trying to access",
			401,
		);

	// @ts-ignore
	guild.joined_at = member?.joined_at;

	return res.send(guild);
});

router.patch(
	"/",
	route({ body: "GuildUpdateSchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as GuildUpdateSchema;
		const { guild_id } = req.params;

		const rights = await getRights(req.user_id);
		const permission = await getPermission(req.user_id, guild_id);

		if (!rights.has("MANAGE_GUILDS") || !permission.has("MANAGE_GUILD"))
			throw DiscordApiErrors.MISSING_PERMISSIONS.withParams(
				"MANAGE_GUILD",
			);

		// TODO: guild update check image

		if (body.icon)
			body.icon = await handleFile(`/icons/${guild_id}`, body.icon);
		if (body.banner)
			body.banner = await handleFile(`/banners/${guild_id}`, body.banner);
		if (body.splash)
			body.splash = await handleFile(
				`/splashes/${guild_id}`,
				body.splash,
			);

		var guild = await Guild.findOneOrFail({
			where: { id: guild_id },
			relations: ["emojis", "roles", "stickers"],
		});
		// TODO: check if body ids are valid
		guild.assign(body);

		const data = guild.toJSON();
		// TODO: guild hashes
		// TODO: fix vanity_url_code, template_id
		delete data.vanity_url_code;
		delete data.template_id;

		await Promise.all([
			guild.save(),
			emitEvent({
				event: "GUILD_UPDATE",
				data,
				guild_id,
			} as GuildUpdateEvent),
		]);

		return res.json(data);
	},
);

export default router;
