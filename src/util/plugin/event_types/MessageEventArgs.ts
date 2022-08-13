import { Message, User } from "util/entities";
import { EventResult } from ".";

export interface PreMessageEventArgs {
	user: User,
    message: Message;
}
export interface PreMessageEventResult extends EventResult {
    message: Partial<Message>
}

export interface OnMessageEventArgs {
	user: User,
    message: Message
}
