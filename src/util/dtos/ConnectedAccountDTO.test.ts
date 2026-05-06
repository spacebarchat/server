import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { ConnectedAccount } from "../entities";
import { ConnectedAccountDTO, getConnectedAccountDTOSelect } from "./ConnectedAccountDTO";

describe("ConnectedAccountDTO", () => {
    const account = {
        external_id: "reddit-account-id",
        user_id: "user-id",
        friend_sync: true,
        name: "reddit-user",
        revoked: false,
        show_activity: 1,
        type: "reddit",
        verified: true,
        visibility: 1,
        integrations: [],
        metadata_: {
            gold: "0",
            mod: "0",
            total_karma: "20223",
            created_at: "2019-05-02T20:28:37",
        },
        metadata_visibility: 1,
        two_way_link: false,
        token_data: {
            access_token: "secret-token",
            fetched_at: 0,
        },
    } as unknown as ConnectedAccount;

    test("maps internal metadata_ to the Discord-compatible metadata field", () => {
        const dto = new ConnectedAccountDTO(account);
        const json = JSON.parse(JSON.stringify(dto)) as Record<string, unknown>;

        assert.deepEqual(json.metadata, account.metadata_);
        assert.equal(json.metadata_visibility, 1);
        assert.equal(Object.hasOwn(json, "metadata_"), false);
        assert.equal(Object.hasOwn(json, "token_data"), false);
    });

    test("omits access tokens from connection update event payloads", () => {
        const dto = new ConnectedAccountDTO(account);
        const json = JSON.parse(JSON.stringify(dto)) as Record<string, unknown>;

        assert.equal(Object.hasOwn(json, "access_token"), false);
    });

    test("includes access tokens only for owner-facing token responses", () => {
        const dto = new ConnectedAccountDTO(account, true);
        const json = JSON.parse(JSON.stringify(dto)) as Record<string, unknown>;

        assert.equal(json.access_token, "secret-token");
    });

    test("selects every column required to build owner-facing connection DTOs", () => {
        assert.deepEqual(getConnectedAccountDTOSelect(), {
            external_id: true,
            user_id: true,
            friend_sync: true,
            name: true,
            revoked: true,
            show_activity: true,
            type: true,
            verified: true,
            visibility: true,
            integrations: true,
            metadata_: true,
            metadata_visibility: true,
            two_way_link: true,
        });

        assert.deepEqual(getConnectedAccountDTOSelect(true), {
            ...getConnectedAccountDTOSelect(),
            token_data: true,
        });
    });
});
