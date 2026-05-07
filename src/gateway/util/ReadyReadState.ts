export const READY_READ_STATE_DEFAULT_LAST_PIN_TIMESTAMP = "1970-01-01T00:00:00+00:00";
const READY_CHANNEL_READ_STATE_TYPE = 0;

export interface ReadyReadStateInput {
    id?: string;
    channel_id: string;
    mention_count?: number;
    last_message_id?: string | null;
    last_pin_timestamp?: Date | string | null;
    last_viewed?: number | null;
    read_state_type?: number;
    flags?: number;
}

export interface ReadyReadStatePayload {
    id: string;
    mention_count: number;
    last_viewed: number;
    last_message_id?: string | null;
    last_pin_timestamp: Date | string;
    flags: number;
}

export function serializeReadyReadState(readStates: ReadyReadStateInput[]): ReadyReadStatePayload[] {
    return readStates
        .filter((readState) => readState.read_state_type === undefined || readState.read_state_type === READY_CHANNEL_READ_STATE_TYPE)
        .map((readState) => {
            const payload: ReadyReadStatePayload = {
                id: readState.channel_id,
                mention_count: readState.mention_count ?? 0,
                last_viewed: readState.last_viewed ?? 0,
                last_pin_timestamp: readState.last_pin_timestamp ?? READY_READ_STATE_DEFAULT_LAST_PIN_TIMESTAMP,
                flags: readState.flags ?? 0,
            };

            if (readState.last_message_id !== null && readState.last_message_id !== undefined) payload.last_message_id = readState.last_message_id;

            return payload;
        });
}
