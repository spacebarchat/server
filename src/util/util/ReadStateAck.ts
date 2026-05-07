import type { MessageAcknowledgeSchema } from "@spacebar/schemas";

export interface AcknowledgeableReadState {
    last_message_id?: string | null;
    mention_count?: number;
    last_viewed?: number | null;
    flags?: number | null;
}

export function applyMessageAcknowledgeToReadState(readState: AcknowledgeableReadState, messageId: string, body: MessageAcknowledgeSchema) {
    readState.last_message_id = messageId;
    readState.mention_count = 0;
    readState.last_viewed = body.last_viewed ?? readState.last_viewed ?? 0;
    readState.flags = body.flags ?? readState.flags ?? 0;

    return readState;
}
