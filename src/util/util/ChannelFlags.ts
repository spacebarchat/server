// based on https://github.com/discordjs/discord.js/blob/master/src/util/MessageFlags.js
// Apache License Version 2.0 Copyright 2015 - 2021 Amish Shah, 2022 Erkin Alp Güney
// @fc-license-skip

import { BitField } from "./BitField";

export class ChannelFlags extends BitField {
    static FLAGS = {
        GUILD_FEED_REMOVED: BigInt(1) << BigInt(0),
        PINNED: BigInt(1) << BigInt(1),
        ACTIVE_CHANNELS_REMOVED: BigInt(1) << BigInt(2),
        REQUIRE_TAG: BigInt(1) << BigInt(4),
        IS_SPAM: BigInt(1) << BigInt(5),
        //Missing 6
        IS_GUILD_RESOURCE_CHANNEL: BigInt(1) << BigInt(7),
        CLYDE_AI: BigInt(1) << BigInt(8),
        IS_SCHEDULED_FOR_DELETION: BigInt(1) << BigInt(9),
        //Unused 10
        SUMMARIES_DISABLED: BigInt(1) << BigInt(11),
        //Deprecated 12
        IS_ROLE_SUBSCRIPTION_TEMPLATE_PREVIEW_CHANNEL: BigInt(1) << BigInt(13),
        IS_BROADCASTING: BigInt(1) << BigInt(14),
        HIDE_MEDIA_DOWNLOAD_OPTIONS: BigInt(1) << BigInt(15),
        IS_JOIN_REQUEST_INTERVIEW_CHANNEL: BigInt(1) << BigInt(16),
        OBFUSCATED: BigInt(1) << BigInt(17),
        //Missing 18
        IS_MODERATOR_REPORT_CHANNEL: BigInt(1) << BigInt(19),
    };
}
