import { Activity, Status } from "@fosscord/util";

export const ActivitySchema = {
	afk: Boolean,
	status: String,
	$activities: [
		{
			name: String,
			type: Number,
			$url: String,
			$created_at: Date,
			$timestamps: [
				{
					$start: Number,
					$end: Number,
				},
			],
			$application_id: String,
			$details: String,
			$state: String,
			$emoji: {
				$name: String,
				$id: String,
				$animated: Boolean,
			},
			$party: {
				$id: String,
				$size: [Number, Number],
			},
			$assets: {
				$large_image: String,
				$large_text: String,
				$small_image: String,
				$small_text: String,
			},
			$secrets: {
				$join: String,
				$spectate: String,
				$match: String,
			},
			$instance: Boolean,
			$flags: String,
		},
	],
	$since: Number, // unix time (in milliseconds) of when the client went idle, or null if the client is not idle
};

export interface ActivitySchema {
	afk: boolean;
	status: Status;
	activities?: Activity[];
	since?: number; // unix time (in milliseconds) of when the client went idle, or null if the client is not idle
}
