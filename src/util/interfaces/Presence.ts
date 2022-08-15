import { ClientStatus, Status } from "./Status";
import { Activity } from "./Activity";
import { PublicUser } from "../entities/User";

export interface Presence {
	user: PublicUser;
	guild_id?: string;
	status: Status;
	activities: Activity[];
	client_status: ClientStatus;
	// TODO: game
}
