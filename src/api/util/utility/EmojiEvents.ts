import type { GuildEmojiUpdateEvent, GuildEmojisUpdateEvent } from "@spacebar/util";

export interface GuildEmojiUpdateEventSource {
    guild_id: string;
}

type EventPayload<TEvent, TData> = Omit<TEvent, "data"> & { data: TData };

export type GuildEmojiUpdateEventData<T extends GuildEmojiUpdateEventSource> = Omit<GuildEmojiUpdateEvent["data"], "emoji"> & { emoji: T };

export function buildGuildEmojiUpdateEventData<T extends GuildEmojiUpdateEventSource>(emoji: T): GuildEmojiUpdateEventData<T> {
    return {
        guild_id: emoji.guild_id,
        emoji,
    };
}

export function buildGuildEmojiPatchEvents<T extends GuildEmojiUpdateEventSource>(
    emoji: T,
    emojis: T[],
): readonly [EventPayload<GuildEmojiUpdateEvent, GuildEmojiUpdateEventData<T>>, EventPayload<GuildEmojisUpdateEvent, { guild_id: string; emojis: T[] }>] {
    return [
        {
            event: "GUILD_EMOJI_UPDATE",
            guild_id: emoji.guild_id,
            data: buildGuildEmojiUpdateEventData(emoji),
        },
        {
            event: "GUILD_EMOJIS_UPDATE",
            guild_id: emoji.guild_id,
            data: {
                guild_id: emoji.guild_id,
                emojis,
            },
        },
    ];
}
