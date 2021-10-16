export interface Activity {
	name: string; // the activity's name
	type: ActivityType; // activity type // TODO: check if its between range 0-5
	url?: string; // stream url, is validated when type is 1
	created_at?: number; // unix timestamp of when the activity was added to the user's session
	timestamps?: {
		// unix timestamps for start and/or end of the game
		start: number;
		end: number;
	};
	application_id?: string; // application id for the game
	details?: string;
	state?: string;
	emoji?: {
		name: string;
		id?: string;
		animated: boolean;
	};
	party?: {
		id?: string;
		size?: [number]; // used to show the party's current and maximum size // TODO: array length 2
	};
	assets?: {
		large_image?: string; // the id for a large asset of the activity, usually a snowflake
		large_text?: string; // text displayed when hovering over the large image of the activity
		small_image?: string; // the id for a small asset of the activity, usually a snowflake
		small_text?: string; // text displayed when hovering over the small image of the activity
	};
	secrets?: {
		join?: string; // the secret for joining a party
		spectate?: string; // the secret for spectating a game
		match?: string; // the secret for a specific instanced match
	};
	instance?: boolean;
	flags: string; // activity flags OR d together, describes what the payload includes
}

export enum ActivityType {
	GAME = 0,
	STREAMING = 1,
	LISTENING = 2,
	CUSTOM = 4,
	COMPETING = 5,
}
