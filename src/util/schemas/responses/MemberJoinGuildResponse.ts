import { Emoji, Guild, Role, Sticker } from "../../entities";

export interface MemberJoinGuildResponse {
	guild: Guild;
	emojis: Emoji[];
	roles: Role[];
	stickers: Sticker[];
}
