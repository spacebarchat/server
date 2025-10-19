import { Message } from "@spacebar/util";
import { InteractionCallbackType } from "./InteractionCallbackType";

export interface InteractionCallbackSchema {
	type: InteractionCallbackType;
	data: Message;
}
