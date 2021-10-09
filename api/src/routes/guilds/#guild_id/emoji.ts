import { Router, Request, Response } from "express";
import {
    Config,
	emitEvent,
	Emoji,
	GuildEmojiUpdateEvent,
	Member,
	User
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";

const router = Router();

export interface EmojiCreateSchema {
    name?: string;
    image?: string;
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

/** WIP
router.post("/", route({ body: "EmojiCreateSchema", permission: "MANAGE_EMOJIS_AND_STICKERS" }), async (req: Request, res: Response) => {
    const guild_id = req.params.guild_id;
	const body = req.body as EmojiCreateSchema;

    const emoji_count = await Emoji.count({ guild_id: guild_id });
    const { maxEmojis } = Config.get().limits.guild;

    if (emoji_count >= maxEmojis) {
        throw new HTTPError("Max emojis reached", 400);
    }
});
*/

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
