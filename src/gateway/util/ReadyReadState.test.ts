import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { READY_READ_STATE_DEFAULT_LAST_PIN_TIMESTAMP, serializeReadyReadState } from "./ReadyReadState";

describe("READY read_state serialization", () => {
    test("serializes read_state as the entries array expected by modern clients", () => {
        const lastPinTimestamp = new Date("2026-05-06T10:00:00.000Z");

        assert.deepEqual(
            serializeReadyReadState([
                {
                    id: "database-row-id",
                    channel_id: "channel-1",
                    mention_count: 0,
                    last_viewed: 3576,
                    last_message_id: "message-1",
                    last_pin_timestamp: lastPinTimestamp,
                    flags: 1,
                },
            ]),
            [
                {
                    id: "channel-1",
                    mention_count: 0,
                    last_viewed: 3576,
                    last_message_id: "message-1",
                    last_pin_timestamp: lastPinTimestamp,
                    flags: 1,
                },
            ],
        );
    });

    test("does not mutate queried read state entities while remapping id", () => {
        const readStates = [
            {
                id: "database-row-id",
                channel_id: "channel-1",
            },
        ];

        serializeReadyReadState(readStates);

        assert.deepEqual(readStates, [
            {
                id: "database-row-id",
                channel_id: "channel-1",
            },
        ]);
    });

    test("defaults optional counters and flags for sparse read states", () => {
        assert.deepEqual(serializeReadyReadState([{ channel_id: "channel-1" }]), [
            {
                id: "channel-1",
                mention_count: 0,
                last_viewed: 0,
                last_pin_timestamp: READY_READ_STATE_DEFAULT_LAST_PIN_TIMESTAMP,
                flags: 0,
            },
        ]);
    });

    test("does not serialize non-channel read-state rows as channel read states", () => {
        assert.deepEqual(
            serializeReadyReadState([
                {
                    channel_id: "guild-home-1",
                    read_state_type: 3,
                },
                {
                    channel_id: "channel-1",
                    read_state_type: 0,
                },
            ]),
            [
                {
                    id: "channel-1",
                    mention_count: 0,
                    last_viewed: 0,
                    last_pin_timestamp: READY_READ_STATE_DEFAULT_LAST_PIN_TIMESTAMP,
                    flags: 0,
                },
            ],
        );
    });
});
