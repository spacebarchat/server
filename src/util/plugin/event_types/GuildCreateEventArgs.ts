import { Guild, User } from "util/entities";
import { EventResult } from ".";

export interface PreGuildCreateEventArgs {
    user: User,
	guild: Guild
}
export interface PreGuildCreateEventResult extends EventResult {
    guild: Partial<Guild>
}

export interface OnGuildCreateEventArgs {
    user: User,
	guild: Guild
}
