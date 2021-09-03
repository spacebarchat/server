import { Embed } from "@fosscord/util";
import { Length } from "../util/instanceOf";

export const EmbedImage = {
	$url: String,
	$width: Number,
	$height: Number
};

const embed = {
	$title: new Length(String, 0, 256), //title of embed
	$type: String, // type of embed (always "rich" for webhook embeds)
	$description: new Length(String, 0, 2048), // description of embed
	$url: String, // url of embed
	$timestamp: String, // ISO8601 timestamp
	$color: Number, // color code of the embed
	$footer: {
		text: new Length(String, 0, 2048),
		icon_url: String,
		proxy_icon_url: String
	}, // footer object	footer information
	$image: EmbedImage, // image object	image information
	$thumbnail: EmbedImage, // thumbnail object	thumbnail information
	$video: EmbedImage, // video object	video information
	$provider: {
		name: String,
		url: String
	}, // provider object	provider information
	$author: {
		name: new Length(String, 0, 256),
		url: String,
		icon_url: String,
		proxy_icon_url: String
	}, // author object	author information
	$fields: new Length(
		[
			{
				name: new Length(String, 0, 256),
				value: new Length(String, 0, 1024),
				$inline: Boolean
			}
		],
		0,
		25
	)
};

export const MessageCreateSchema = {
	$content: new Length(String, 0, 2000),
	$nonce: String,
	$tts: Boolean,
	$flags: String,
	$embed: embed,
	// TODO: ^ embed is deprecated in favor of embeds (https://discord.com/developers/docs/resources/channel#message-object)
	// $embeds: [embed],
	$allowed_mentions: {
		$parse: [String],
		$roles: [String],
		$users: [String],
		$replied_user: Boolean
	},
	$message_reference: {
		message_id: String,
		channel_id: String,
		$guild_id: String,
		$fail_if_not_exists: Boolean
	},
	$payload_json: String,
	$file: Object
};

export interface MessageCreateSchema {
	content?: string;
	nonce?: string;
	tts?: boolean;
	flags?: string;
	embed?: Embed & { timestamp?: string };
	allowed_mentions?: {
		parse?: string[];
		roles?: string[];
		users?: string[];
		replied_user?: boolean;
	};
	message_reference?: {
		message_id: string;
		channel_id: string;
		guild_id?: string;
		fail_if_not_exists?: boolean;
	};
	payload_json?: string;
	file?: any;
}
