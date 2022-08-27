import { Channel, Guild, User } from "util/entities";
import { EventResult } from ".";

export interface PreTypingEventArgs {
	channel: Channel;
	guild: Guild;
	user: User;
}
export interface PreTypingEventResult extends EventResult {}

export interface OnTypingEventArgs {
	channel: Channel;
	guild: Guild;
	user: User;
}
