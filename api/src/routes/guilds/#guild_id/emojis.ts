import { Router, Request, Response } from "express";
import { Config, DiscordApiErrors, emitEvent, Emoji, GuildEmojisUpdateEvent, handleFile, Member, Snowflake, User } from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

export interface EmojiCreateSchema {
	name?: string;
	image: string;
	require_colons?: boolean | null;
	roles?: string[];
}

export interface EmojiModifySchema {
	name?: string;
	roles?: string[];
}

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;

	await Member.IsInGuildOrFail(req.user_id, guild_id);

	const emojis = await Emoji.find({ where: { guild_id: guild_id }, relations: ["user"] });

	return res.json(emojis);
});

router.get("/:emoji_id", route({}), async (req: Request, res: Response) => {
	const { guild_id, emoji_id } = req.params;

	await Member.IsInGuildOrFail(req.user_id, guild_id);

	const emoji = await Emoji.findOneOrFail({ where: { guild_id: guild_id, id: emoji_id }, relations: ["user"] });

	return res.json(emoji);
});

router.post("/", route({ body: "EmojiCreateSchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const body = req.body as EmojiCreateSchema;

	const id = Snowflake.generate();
	const emoji_count = await Emoji.count({ guild_id: guild_id });
	const { maxEmojis } = Config.get().limits.guild;

	if (emoji_count >= maxEmojis) throw DiscordApiErrors.MAXIMUM_NUMBER_OF_EMOJIS_REACHED.withParams(maxEmojis);
	if (body.require_colons == null) body.require_colons = true;

	const user = await User.findOneOrFail({ id: req.user_id });
	body.image = (await handleFile(`/emojis/${id}`, body.image)) as string;

	const emoji = await new Emoji({
		id: id,
		guild_id: guild_id,
		...body,
		user: user,
		managed: false,
		animated: false, // TODO: Add support animated emojis
		available: true,
		roles: []
	}).save();

	await emitEvent({
		event: "GUILD_EMOJIS_UPDATE",
		guild_id: guild_id,
		data: {
			guild_id: guild_id,
			emojis: await Emoji.find({ guild_id: guild_id })
		}
	} as GuildEmojisUpdateEvent);

	return res.status(201).json(emoji);
});

router.patch(
	"/:emoji_id",
	route({ body: "EmojiModifySchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }),
	async (req: Request, res: Response) => {
		const { emoji_id, guild_id } = req.params;
		const body = req.body as EmojiModifySchema;

		const emoji = await new Emoji({ ...body, id: emoji_id, guild_id: guild_id }).save();

		await emitEvent({
			event: "GUILD_EMOJIS_UPDATE",
			guild_id: guild_id,
			data: {
				guild_id: guild_id,
				emojis: await Emoji.find({ guild_id: guild_id })
			}
		} as GuildEmojisUpdateEvent);

		return res.json(emoji);
	}
);

router.delete("/:emoji_id", route({ permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
	const { emoji_id, guild_id } = req.params;

	await Emoji.delete({
		id: emoji_id,
		guild_id: guild_id
	});

	await emitEvent({
		event: "GUILD_EMOJIS_UPDATE",
		guild_id: guild_id,
		data: {
			guild_id: guild_id,
			emojis: await Emoji.find({ guild_id: guild_id })
		}
	} as GuildEmojisUpdateEvent);

	res.sendStatus(204);
});

export default router;
