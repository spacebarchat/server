// based on https://github.com/discordjs/discord.js/blob/master/src/util/MessageFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah, 2022 Erkin Alp Güney
// @fc-license-skip

import { BitField } from "./BitField";

export class MessageFlags extends BitField {
    static FLAGS = {
        CROSSPOSTED: 1n,
        IS_CROSSPOST: 1n << 1n,
        SUPPRESS_EMBEDS: 1n << 2n,
        SOURCE_MESSAGE_DELETED: 1n << 3n,
        URGENT: 1n << 4n,
        HAS_THREAD: 1n << 5n,
        EPHEMERAL: 1n << 6n,
        LOADING: 1n << 17n,
        FAILED_TO_MENTION_SOME_ROLES_IN_THREAD: 1n << 8n,
        GUILD_FEED_HIDDEN: 1n << 9n,
        SHOULD_SHOW_LINK_NOT_DISCORD_WARNING: 1n << 10n,
        // 1<<11 not documented
        SUPPRESS_NOTIFICATIONS: 1n << 12n,
        IS_VOICE_MESSAGE: 1n << 13n,
        HAS_SNAPSHOT: 1n << 14n,
        IS_COMPONENTS_V2: 1n << 15n,
        SENT_BY_SOCIAL_LAYER_INTEGRATION: 1n << 16n,
    };
}
