import { ClientStatus, Status } from "./Status";
import { Activity } from "./Activity";

export interface Presence {
	user_id: string;
	guild_id?: string;
	status: Status;
	activities: Activity[];
	client_status: ClientStatus;
}
