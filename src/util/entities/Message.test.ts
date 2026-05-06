import { describe, test } from "node:test";
import assert from "node:assert/strict";

function attachmentUrl(filename: string, messageId = "message-id") {
    return `https://cdn.example/attachments/channel-id/${messageId}/${filename}`;
}

function assertSignedAttachmentUrl(url: string | undefined, pathname: string) {
    assert.ok(url);
    const parsed = new URL(url);
    assert.equal(parsed.pathname, pathname);
    assert.ok(parsed.searchParams.get("ex"));
    assert.ok(parsed.searchParams.get("is"));
    assert.ok(parsed.searchParams.get("hm"));
}

async function getMessageSigningContext() {
    process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar";
    const { Message } = await import("./Message.js");
    const { NewUrlUserSignatureData } = await import("../Signing.js");

    return {
        Message,
        data: new NewUrlUserSignatureData({
            ip: "203.0.113.10",
            userAgent: "test-agent",
        }),
    };
}

describe("Message.withSignedAttachments", () => {
    test("signs attachment-derived embed and component media urls", async () => {
        const { Message, data } = await getMessageSigningContext();

        const imageUrl = attachmentUrl("image.png");
        const thumbnailUrl = attachmentUrl("thumb.png");
        const footerUrl = attachmentUrl("footer.png");
        const authorUrl = attachmentUrl("author.png");
        const galleryUrl = attachmentUrl("gallery.png");
        const galleryProxyUrl = attachmentUrl("gallery-proxy.png");
        const publicAttachmentUrl = attachmentUrl("top-level.png");
        const externalUrl = "https://example.com/assets/external.png";
        const message = {
            attachments: [
                {
                    filename: "top-level.png",
                    size: 1,
                    url: publicAttachmentUrl,
                    proxy_url: publicAttachmentUrl,
                },
            ],
            embeds: [
                {
                    footer: {
                        text: "footer",
                        icon_url: footerUrl,
                        proxy_icon_url: footerUrl,
                    },
                    image: {
                        url: imageUrl,
                        proxy_url: imageUrl,
                    },
                    thumbnail: {
                        url: thumbnailUrl,
                        proxy_url: thumbnailUrl,
                    },
                    author: {
                        name: "author",
                        icon_url: authorUrl,
                        proxy_icon_url: authorUrl,
                    },
                    provider: {
                        url: externalUrl,
                    },
                },
            ],
            components: [
                {
                    type: 12,
                    items: [
                        {
                            media: {
                                url: galleryUrl,
                                proxy_url: galleryProxyUrl,
                            },
                        },
                        {
                            media: {
                                url: externalUrl,
                                proxy_url: galleryProxyUrl,
                            },
                        },
                    ],
                },
            ],
        };

        const signed = Message.prototype.withSignedAttachments.call(message, data) as unknown as {
            embeds: {
                footer: { icon_url: string; proxy_icon_url: string };
                image: { url: string; proxy_url: string };
                thumbnail: { url: string; proxy_url: string };
                author: { icon_url: string; proxy_icon_url: string };
            }[];
            attachments: {
                url: string;
                proxy_url: string;
            }[];
            components: {
                items: {
                    media: { url: string; proxy_url: string };
                }[];
            }[];
        };

        assertSignedAttachmentUrl(signed.embeds[0].image.url, "/attachments/channel-id/message-id/image.png");
        assertSignedAttachmentUrl(signed.embeds[0].image.proxy_url, "/attachments/channel-id/message-id/image.png");
        assertSignedAttachmentUrl(signed.embeds[0].thumbnail.url, "/attachments/channel-id/message-id/thumb.png");
        assertSignedAttachmentUrl(signed.embeds[0].footer.icon_url, "/attachments/channel-id/message-id/footer.png");
        assertSignedAttachmentUrl(signed.embeds[0].author.icon_url, "/attachments/channel-id/message-id/author.png");
        assertSignedAttachmentUrl(signed.attachments[0].url, "/attachments/channel-id/message-id/top-level.png");
        assertSignedAttachmentUrl(signed.attachments[0].proxy_url, "/attachments/channel-id/message-id/top-level.png");
        assertSignedAttachmentUrl(signed.components[0].items[0].media.url, "/attachments/channel-id/message-id/gallery.png");
        assertSignedAttachmentUrl(signed.components[0].items[0].media.proxy_url, "/attachments/channel-id/message-id/gallery-proxy.png");
        assert.equal(signed.components[0].items[1].media.url, externalUrl);
        assertSignedAttachmentUrl(signed.components[0].items[1].media.proxy_url, "/attachments/channel-id/message-id/gallery-proxy.png");

        assert.equal(message.embeds[0].image.url, imageUrl);
        assert.equal(message.components[0].items[0].media.url, galleryUrl);
    });

    test("preserves Message.toJSON public DTO defaults when signing an entity", async () => {
        const { Message, data } = await getMessageSigningContext();
        const imageUrl = attachmentUrl("entity-image.png");
        const message = new Message();
        Object.assign(message, {
            id: "message-id",
            channel_id: "channel-id",
            timestamp: new Date("2026-01-02T03:04:05.000Z"),
            mentions: [],
            mention_roles: [],
            mention_channels: [],
            embeds: [
                {
                    image: {
                        url: imageUrl,
                        proxy_url: imageUrl,
                    },
                },
            ],
            reactions: [],
            type: 0,
            flags: 0,
            message_snapshots: [],
        });

        const publicDto = message.toJSON();
        const signed = message.withSignedAttachments(data) as typeof publicDto;
        const { embeds: _publicEmbeds, ...publicWithoutEmbeds } = publicDto;
        const { embeds: signedEmbeds, ...signedWithoutEmbeds } = signed;

        assert.deepEqual(signedWithoutEmbeds, publicWithoutEmbeds);
        assert.equal(signed.timestamp, "2026-01-02T03:04:05.000Z");
        assert.equal(signed.edited_timestamp, null);
        assert.deepEqual(signed.attachments, []);
        assert.deepEqual(signed.components, []);
        assert.equal(signed.content, "");
        assert.equal(signed.tts, false);
        assert.equal(signed.mention_everyone, false);
        assert.equal((signed as { author_id?: string }).author_id, undefined);
        assert.equal((signed as { member_id?: string }).member_id, undefined);
        assertSignedAttachmentUrl(signedEmbeds[0].image?.url, "/attachments/channel-id/message-id/entity-image.png");
    });

    test("signs attachment-derived embed and component urls on referenced_message", async () => {
        const { Message, data } = await getMessageSigningContext();
        const imageUrl = attachmentUrl("referenced-image.png", "referenced-message-id");
        const videoUrl = attachmentUrl("referenced-video.mp4", "referenced-message-id");
        const galleryUrl = attachmentUrl("referenced-gallery.png", "referenced-message-id");
        const externalUrl = "https://example.com/assets/external.png";
        const message = {
            attachments: [],
            embeds: [],
            components: [],
            referenced_message: {
                attachments: [],
                embeds: [
                    {
                        image: {
                            url: imageUrl,
                            proxy_url: imageUrl,
                        },
                        video: {
                            url: videoUrl,
                            proxy_url: videoUrl,
                        },
                    },
                ],
                components: [
                    {
                        type: 12,
                        items: [
                            {
                                media: {
                                    url: galleryUrl,
                                    proxy_url: galleryUrl,
                                },
                            },
                            {
                                media: {
                                    url: externalUrl,
                                    proxy_url: externalUrl,
                                },
                            },
                        ],
                    },
                ],
            },
        };

        const signed = Message.prototype.withSignedAttachments.call(message, data) as unknown as {
            referenced_message: {
                embeds: { image: { url: string; proxy_url: string }; video: { url: string; proxy_url: string } }[];
                components: { items: { media: { url: string; proxy_url: string } }[] }[];
            };
        };

        assertSignedAttachmentUrl(signed.referenced_message.embeds[0].image.url, "/attachments/channel-id/referenced-message-id/referenced-image.png");
        assertSignedAttachmentUrl(signed.referenced_message.embeds[0].video.url, "/attachments/channel-id/referenced-message-id/referenced-video.mp4");
        assertSignedAttachmentUrl(signed.referenced_message.components[0].items[0].media.url, "/attachments/channel-id/referenced-message-id/referenced-gallery.png");
        assertSignedAttachmentUrl(signed.referenced_message.components[0].items[0].media.proxy_url, "/attachments/channel-id/referenced-message-id/referenced-gallery.png");
        assert.equal(signed.referenced_message.components[0].items[1].media.url, externalUrl);
        assert.equal(signed.referenced_message.components[0].items[1].media.proxy_url, externalUrl);

        assert.equal(message.referenced_message.embeds[0].image.url, imageUrl);
        assert.equal(message.referenced_message.components[0].items[0].media.url, galleryUrl);
    });

    test("signs attachment urls inside message_snapshots", async () => {
        const { Message, data } = await getMessageSigningContext();
        const attachment = attachmentUrl("snapshot-attachment.png", "snapshot-message-id");
        const thumbnail = attachmentUrl("snapshot-thumbnail.png", "snapshot-message-id");
        const file = attachmentUrl("snapshot-file.pdf", "snapshot-message-id");
        const message = {
            attachments: [],
            embeds: [],
            components: [],
            message_snapshots: [
                {
                    message: {
                        content: "forwarded",
                        timestamp: new Date("2026-01-02T03:04:05.000Z"),
                        mentions: [],
                        mention_roles: [],
                        attachments: [
                            {
                                filename: "snapshot-attachment.png",
                                size: 1,
                                url: attachment,
                                proxy_url: attachment,
                            },
                        ],
                        embeds: [
                            {
                                thumbnail: {
                                    url: thumbnail,
                                    proxy_url: thumbnail,
                                },
                            },
                        ],
                        type: 0,
                        flags: 0,
                        components: [
                            {
                                type: 13,
                                file: {
                                    url: file,
                                    proxy_url: file,
                                },
                                spoiler: false,
                                name: "snapshot-file.pdf",
                                size: 1,
                            },
                        ],
                    },
                },
            ],
        };

        const signed = Message.prototype.withSignedAttachments.call(message, data) as unknown as {
            message_snapshots: {
                message: {
                    attachments: { url: string; proxy_url: string }[];
                    embeds: { thumbnail: { url: string; proxy_url: string } }[];
                    components: { file: { url: string; proxy_url: string } }[];
                };
            }[];
        };
        const signedSnapshot = signed.message_snapshots[0].message;

        assertSignedAttachmentUrl(signedSnapshot.attachments[0].url, "/attachments/channel-id/snapshot-message-id/snapshot-attachment.png");
        assertSignedAttachmentUrl(signedSnapshot.attachments[0].proxy_url, "/attachments/channel-id/snapshot-message-id/snapshot-attachment.png");
        assertSignedAttachmentUrl(signedSnapshot.embeds[0].thumbnail.url, "/attachments/channel-id/snapshot-message-id/snapshot-thumbnail.png");
        assertSignedAttachmentUrl(signedSnapshot.components[0].file.url, "/attachments/channel-id/snapshot-message-id/snapshot-file.pdf");
        assert.equal(message.message_snapshots[0].message.attachments[0].url, attachment);
        assert.equal(message.message_snapshots[0].message.embeds[0].thumbnail.url, thumbnail);
        assert.equal(message.message_snapshots[0].message.components[0].file.url, file);
    });
});
