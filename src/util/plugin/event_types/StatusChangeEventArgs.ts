import { User } from "util/entities";
import { Presence } from "util/interfaces";
import { EventResult } from ".";

export interface PreStatusChangeEventArgs {
    user: User,
	presence: Presence
}
export interface PreStatusChangeEventResult extends EventResult {
    presence: Partial<Presence>
}

export interface OnStatusChangeEventArgs {
    user: User,
	presence: Presence
}
