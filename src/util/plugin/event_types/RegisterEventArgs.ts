import { User } from "util/entities";
import { EventResult } from ".";

export interface PreRegisterEventArgs {
	age: any,
	user: User,
	ip: String
}
export interface PreRegisterEventResult extends EventResult {
    user: Partial<User>
}

export interface OnRegisterEventArgs {
    age: any,
	user: User,
	ip: String
}
