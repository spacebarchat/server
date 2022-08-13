import { User } from "util/entities";
import { EventResult } from ".";

export interface PreLoginEventArgs {
	ip: String,
	user: User
}
export interface PreLoginEventResult extends EventResult {
    
}

export interface OnLoginEventArgs {
	ip: String,
	user: User
}
