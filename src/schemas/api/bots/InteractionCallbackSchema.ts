import { MessageCreateSchema } from "@spacebar/schemas";
import { InteractionCallbackType } from "./InteractionCallbackType";

export interface InteractionCallbackSchema {
	type: InteractionCallbackType;
	data: MessageCreateSchema;
}
