import { PublicUser } from "../entities/User";
import { Activity } from "./Activity";
import { ClientStatus, Status } from "./Status";

export interface Presence {
	user: PublicUser;
	guild_id?: string;
	status: Status;
	activities: Activity[];
	client_status: ClientStatus;
	// TODO: game
}
