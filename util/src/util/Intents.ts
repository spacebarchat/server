import { BitField } from "./BitField";

export class Intents extends BitField {
	static FLAGS = {
		GUILDS: BigInt(1) << BigInt(0),
		GUILD_MEMBERS: BigInt(1) << BigInt(1),
		GUILD_BANS: BigInt(1) << BigInt(2),
		GUILD_EMOJIS: BigInt(1) << BigInt(3),
		GUILD_INTEGRATIONS: BigInt(1) << BigInt(4),
		GUILD_WEBHOOKS: BigInt(1) << BigInt(5),
		GUILD_INVITES: BigInt(1) << BigInt(6),
		GUILD_VOICE_STATES: BigInt(1) << BigInt(7),
		GUILD_PRESENCES: BigInt(1) << BigInt(8),
		GUILD_MESSAGES: BigInt(1) << BigInt(9),
		GUILD_MESSAGE_REACTIONS: BigInt(1) << BigInt(10),
		GUILD_MESSAGE_TYPING: BigInt(1) << BigInt(11),
		DIRECT_MESSAGES: BigInt(1) << BigInt(12),
		DIRECT_MESSAGE_REACTIONS: BigInt(1) << BigInt(13),
		DIRECT_MESSAGE_TYPING: BigInt(1) << BigInt(14),
	};
}
