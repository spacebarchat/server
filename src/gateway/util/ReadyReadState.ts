export interface ReadyReadStateInput {
    id?: string;
    channel_id: string;
    mention_count?: number;
    last_message_id?: string | null;
    last_pin_timestamp?: Date | string | null;
    flags?: number;
}

export interface ReadyReadStatePayload {
    id: string;
    mention_count: number;
    last_message_id?: string | null;
    last_pin_timestamp?: Date | string | null;
    flags: number;
}

export function serializeReadyReadState(readStates: ReadyReadStateInput[]): ReadyReadStatePayload[] {
    return readStates.map((readState) => {
        const payload: ReadyReadStatePayload = {
            id: readState.channel_id,
            mention_count: readState.mention_count ?? 0,
            flags: readState.flags ?? 0,
        };

        if (readState.last_message_id !== null && readState.last_message_id !== undefined) payload.last_message_id = readState.last_message_id;
        if (readState.last_pin_timestamp !== null && readState.last_pin_timestamp !== undefined) payload.last_pin_timestamp = readState.last_pin_timestamp;

        return payload;
    });
}
