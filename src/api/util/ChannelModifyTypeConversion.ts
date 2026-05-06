import { ObjectErrorContent, makeObjectErrorContent } from "../../util/util/FieldError";

export const CHANNEL_MODIFY_GUILD_TEXT = 0;
export const CHANNEL_MODIFY_GUILD_NEWS = 5;
export const CHANNEL_MODIFY_CONVERTIBLE_TYPES = [CHANNEL_MODIFY_GUILD_TEXT, CHANNEL_MODIFY_GUILD_NEWS] as const;

export function isChannelModifyConvertibleType(type: number): boolean {
    return CHANNEL_MODIFY_CONVERTIBLE_TYPES.includes(type as (typeof CHANNEL_MODIFY_CONVERTIBLE_TYPES)[number]);
}

export function getChannelModifyTypeConversionError(currentType: number, requestedType: number | undefined, guildFeatures: readonly string[]): ObjectErrorContent | undefined {
    if (requestedType === undefined || requestedType === currentType) return undefined;

    if (!isChannelModifyConvertibleType(currentType) || !isChannelModifyConvertibleType(requestedType)) {
        return makeObjectErrorContent("BASE_TYPE_CHOICES", "Only text and news channels can be converted");
    }

    if (requestedType === CHANNEL_MODIFY_GUILD_NEWS && !guildFeatures.includes("NEWS")) {
        return makeObjectErrorContent("BASE_TYPE_CHOICES", "News channels require the NEWS guild feature");
    }

    return undefined;
}
