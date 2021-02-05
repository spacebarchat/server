import { EmojiSchema } from "./Emoji";

export const ActivitySchema = {
	afk: Boolean,
	status: String,
	$activities: [
		{
			name: String, // the activity's name
			type: Number, // activity type // TODO: check if its between range 0-5
			$url: String, // stream url, is validated when type is 1
			$created_at: Number, // unix timestamp of when the activity was added to the user's session
			$timestamps: {
				// unix timestamps for start and/or end of the game
				start: Number,
				end: Number,
			},
			$application_id: BigInt, // application id for the game
			$details: String,
			$State: String,
			$emoji: EmojiSchema,
			$party: {
				$id: String,
				$size: [Number], // used to show the party's current and maximum size // TODO: array length 2
			},
			$assets: {
				$large_image: String, // the id for a large asset of the activity, usually a snowflake
				$large_text: String, // text displayed when hovering over the large image of the activity
				$small_image: String, // the id for a small asset of the activity, usually a snowflake
				$small_text: String, // text displayed when hovering over the small image of the activity
			},
			$secrets: {
				$join: String, // the secret for joining a party
				$spectate: String, // the secret for spectating a game
				$match: String, // the secret for a specific instanced match
			},
			$instance: Boolean,
			flags: BigInt, // activity flags OR d together, describes what the payload includes
		},
	],
	$since: Number, // unix time (in milliseconds) of when the client went idle, or null if the client is not idle
};
