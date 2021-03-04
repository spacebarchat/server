export const MessageCreateSchema = {
	content: String,
	nonce: Number,
	tts: Boolean,
	embed: {},
	allowed_mentions: [],
	message_reference: {
		message_id: BigInt,
		channel_id: BigInt,
		guild_id: BigInt,
		fail_if_not_exists: Boolean,
	},
};

export interface MessageCreateSchema {
	content: string;
	nonce: number;
	tts: boolean;
	embed: {};
	allowed_mentions: [];
	message_reference: {
		message_id: bigint;
		channel_id: bigint;
		guild_id: bigint;
		fail_if_not_exists: boolean;
	};
}
