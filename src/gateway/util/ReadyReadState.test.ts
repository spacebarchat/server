import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { serializeReadyReadState } from "./ReadyReadState";

describe("READY read_state serialization", () => {
    test("serializes read_state as the entries array expected by modern clients", () => {
        assert.deepEqual(
            serializeReadyReadState([
                {
                    id: "database-row-id",
                    channel_id: "channel-1",
                    mention_count: 0,
                    last_message_id: "message-1",
                    flags: 1,
                },
            ]),
            [
                {
                    id: "channel-1",
                    mention_count: 0,
                    last_message_id: "message-1",
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
                flags: 0,
            },
        ]);
    });
});
