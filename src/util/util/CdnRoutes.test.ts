import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getCloudAttachmentCdnPath, getCloudAttachmentCdnUrl, getCloudAttachmentCloneCdnUrl } from "./CdnRoutes";

describe("CDN route helpers", () => {
    test("builds internal cloud attachment paths under the Spacebar CDN namespace", () => {
        assert.equal(getCloudAttachmentCdnPath("channel/batch/0/file.png"), "/_spacebar/cdn/attachments/channel/batch/0/file.png");
    });

    test("builds public upload URLs for cloud attachments under the internal CDN namespace", () => {
        assert.equal(getCloudAttachmentCdnUrl("https://cdn.example", "channel/batch/0/file.png"), "https://cdn.example/_spacebar/cdn/attachments/channel/batch/0/file.png");
    });

    test("handles endpoint and filename slashes without duplicating separators", () => {
        assert.equal(getCloudAttachmentCdnUrl("https://cdn.example/", "/channel/batch/0/file.png"), "https://cdn.example/_spacebar/cdn/attachments/channel/batch/0/file.png");
    });

    test("builds internal clone URLs for cloud attachment conversion", () => {
        assert.equal(
            getCloudAttachmentCloneCdnUrl("http://127.0.0.1:3001", "channel/batch/0/file.png", "message"),
            "http://127.0.0.1:3001/_spacebar/cdn/attachments/channel/batch/0/file.png/clone_to_message/message",
        );
    });
});
