import { ClientStatus } from "../../interfaces";

export interface GuildWidgetJsonResponse {
	id: string;
	name: string;
	instant_invite: string;
	channels: {
		id: string;
		name: string;
		position: number;
	}[];
	members: {
		id: string;
		username: string;
		discriminator: string;
		avatar: string | null;
		status: ClientStatus;
		avatar_url: string;
	}[];
	presence_count: number;
}
