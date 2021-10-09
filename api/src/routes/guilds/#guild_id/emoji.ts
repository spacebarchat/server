import { Router, Request, Response } from "express";
import {
    Config,
	DiscordApiErrors,
	emitEvent,
	Emoji,
	GuildEmojiUpdateEvent,
	handleFile,
	Member,
	Snowflake,
	User
} from "@fosscord/util";
import { route } from "@fosscord/api";

const router = Router();

export interface EmojiCreateSchema {
    name?: string;
    image?: string;
    require_colons?: boolean | null;
    roles?: string[];
}

export interface EmojiModifySchema {
    name?: string;
    roles?: string[];
}

router.get("/", route({}), async (req: Request, res: Response) => {
    const guild_id = req.params.guild_id;

    await Member.IsInGuildOrFail(req.user_id, guild_id);

    const emojis = await Emoji.find({ guild_id: guild_id });

    return res.json(emojis);
});

router.get("/:emoji_id", route({}), async (req: Request, res: Response) => {
    const guild_id = req.params.guild_id;
    const emoji_id = req.params.emoji_id;

    await Member.IsInGuildOrFail(req.user_id, guild_id);

    const emoji = await Emoji.findOneOrFail({ guild_id: guild_id, id: emoji_id });

    return res.json(emoji);
});

router.post("/", route({ body: "EmojiCreateSchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
    const guild_id = req.params.guild_id;
	const body = req.body as EmojiCreateSchema;

    const emoji_count = await Emoji.count({ guild_id: guild_id });
    const { maxEmojis } = Config.get().limits.guild;

    if (emoji_count >= maxEmojis) throw DiscordApiErrors.MAXIMUM_NUMBER_OF_EMOJIS_REACHED.withParams(maxEmojis);

    const id = Snowflake.generate();

    if (!body.image) {
        throw DiscordApiErrors.GENERAL_ERROR.withParams("No image provided");
    }

    if (body.require_colons === null) body.require_colons = true;

    const user = await User.findOneOrFail({ id: req.user_id });

    body.image = await handleFile(`/emojis/${id}`, body.image);

    const emoji = new Emoji({
        id: id,
        guild_id: guild_id,
        ...body,
        user: user,
        managed: false,
        animated: false, // TODO: Add support animated emojis
        available: true
    });

    await Promise.all([
        emoji.save(),
        emitEvent({
            event: "GUILD_EMOJI_UPDATE",
            guild_id: guild_id,
            data: {
                guild_id: guild_id,
                emojis: await Emoji.find({ guild_id: guild_id })
            }
        } as GuildEmojiUpdateEvent)
    ]);
});

router.patch("/:emoji_id", route({ body: "EmojiModifySchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
    const { emoji_id, guild_id } = req.params;
    const body = req.body as EmojiModifySchema;

    const emoji = new Emoji({ ...body, id: emoji_id, guild_id: guild_id });

    await Promise.all([
        emoji.save(),
        emitEvent({
            event: "GUILD_EMOJI_UPDATE",
            guild_id: guild_id,
            data: {
                guild_id: guild_id,
                emojis: await Emoji.find({ guild_id: guild_id })
            }
        } as GuildEmojiUpdateEvent)
    ]);

    return res.json(emoji);
});

router.delete("/:emoji_id", route({ permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
    const guild_id = req.params.guild_id;
    const { emoji_id } = req.params;

    await Promise.all([
        Emoji.delete({
            id: emoji_id,
            guild_id: guild_id
        }),
        emitEvent({
            event: "GUILD_EMOJI_UPDATE",
            guild_id: guild_id,
            data: {
                guild_id: guild_id,
                emojis: await Emoji.find({ guild_id: guild_id })
            }
        } as GuildEmojiUpdateEvent)
    ])

    res.sendStatus(204);
});

export default router;
