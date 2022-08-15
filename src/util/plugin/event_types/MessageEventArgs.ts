import { Message } from "util/entities";
import { EventResult } from ".";

export interface PreMessageEventArgs {
    message: Message;
}
export interface PreMessageEventResult extends EventResult {
    
}

export interface OnMessageEventArgs {
    
}
