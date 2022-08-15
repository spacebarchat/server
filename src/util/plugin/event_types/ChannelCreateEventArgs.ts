import { Channel, Guild, User } from "util/entities";
import { EventResult } from ".";

export interface PreChannelCreateEventArgs {
    channel: Channel,
	guild: Guild,
	user: User
}
export interface PreChannelCreateEventResult extends EventResult {
    channel: Partial<Channel>
}

export interface OnChannelCreateEventArgs {
    channel: Channel,
	guild: Guild,
	user: User
}
