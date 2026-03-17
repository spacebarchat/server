import { Snowflake } from "../../Identifiers";
import { PartialUser } from "../users";

export type StickersResponse = StickerResponse[];
export interface StickerResponse {
    id: Snowflake;
    pack_id?: Snowflake;
    name: string;
    description: string | null;
    tags: string;
    type: StickerType;
    format_type: StickerFormatType;
    available?: boolean;
    guild_id?: Snowflake;
    // Only filled for Get Guild Sticker(/s)
    user?: PartialUser;
    // Only filled in for sticker packs
    sort_value?: number;
}

export enum StickerType {
    STANDARD = 1,
    GUILD = 2,
}

export enum StickerFormatType {
    PNG = 1,
    APNG = 2,
    LOTTIE = 3,
    GIF = 4,
}
