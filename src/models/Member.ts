import { Role } from "./Role";
import { User } from "./User";

export interface Member {
	user: User;
	nick: string;
	roles: Role[];
	joined_at: number;
	premium_since: number;
	deaf: boolean;
	mute: boolean;
	pending: boolean;
	permissions: string;
}
