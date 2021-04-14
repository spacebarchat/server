import { Embed, EmbedImage } from "fosscord-server-util";
import { Length } from "../util/instanceOf";

export const MessageCreateSchema = {
	$content: new Length(String, 0, 2000),
	$nonce: String,
	$tts: Boolean,
	$embed: {
		$title: new Length(String, 0, 256), //title of embed
		$type: String, // type of embed (always "rich" for webhook embeds)
		$description: new Length(String, 0, 2048), // description of embed
		$url: String, // url of embed
		$timestamp: String, // ISO8601 timestamp
		$color: Number, // color code of the embed
		$footer: {
			text: new Length(String, 0, 2048),
			icon_url: String,
			proxy_icon_url: String,
		}, // footer object	footer information
		$image: EmbedImage, // image object	image information
		$thumbnail: EmbedImage, // thumbnail object	thumbnail information
		$video: EmbedImage, // video object	video information
		$provider: {
			name: String,
			url: String,
		}, // provider object	provider information
		$author: {
			name: new Length(String, 0, 256),
			url: String,
			icon_url: String,
			proxy_icon_url: String,
		}, // author object	author information
		$fields: new Length(
			[
				{
					name: new Length(String, 0, 256),
					value: new Length(String, 0, 1024),
					$inline: Boolean,
				},
			],
			0,
			25
		),
	},
	$allowed_mentions: [],
	$message_reference: {
		message_id: BigInt,
		channel_id: BigInt,
		$guild_id: BigInt,
		$fail_if_not_exists: Boolean,
	},
	$payload_json: String,
	$file: Object,
};

export interface MessageCreateSchema {
	content?: string;
	nonce?: string;
	tts?: boolean;
	embed?: Embed & { timestamp?: string };
	allowed_mentions?: [];
	message_reference?: {
		message_id: bigint;
		channel_id: bigint;
		guild_id?: bigint;
		fail_if_not_exists: boolean;
	};
	payload_json?: string;
}
