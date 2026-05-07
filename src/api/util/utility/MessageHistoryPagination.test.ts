import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getMessageHistoryQueryOrder, sortMessagesNewestFirst } from "./MessageHistoryPagination";

describe("message history pagination", () => {
    test("uses descending id order for default and before pages", () => {
        assert.deepEqual(getMessageHistoryQueryOrder({}), { id: "DESC" });
        assert.deepEqual(getMessageHistoryQueryOrder({ after: undefined }), { id: "DESC" });
    });

    test("uses ascending id order to select the nearest messages after a cursor", () => {
        assert.deepEqual(getMessageHistoryQueryOrder({ after: "50" }), { id: "ASC" });
    });

    test("returns the selected after page newest first", () => {
        const selectedAfterPage = Array.from({ length: 30 }, (_, index) => ({
            id: String(51 + index),
        }));

        assert.deepEqual(
            sortMessagesNewestFirst(selectedAfterPage).map((message) => message.id),
            Array.from({ length: 30 }, (_, index) => String(80 - index)),
        );
    });

    test("orders by snowflake id instead of timestamp", () => {
        const timestamp = new Date(0);
        const messages = [
            { id: "100", timestamp },
            { id: "102", timestamp },
            { id: "101", timestamp },
        ];

        assert.deepEqual(
            sortMessagesNewestFirst(messages).map((message) => message.id),
            ["102", "101", "100"],
        );
    });
});
