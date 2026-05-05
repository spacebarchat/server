import { describe, test } from "node:test";
import assert from "node:assert/strict";

function assertSignedAttachmentUrl(url: string | undefined, pathname: string) {
    assert.ok(url);
    const parsed = new URL(url);
    assert.equal(parsed.pathname, pathname);
    assert.ok(parsed.searchParams.get("ex"));
    assert.ok(parsed.searchParams.get("is"));
    assert.ok(parsed.searchParams.get("hm"));
}

describe("Message.withSignedAttachments", () => {
    test("signs attachment-derived embed and component media urls", async () => {
        process.env.DATABASE ??= "postgres://spacebar:spacebar@localhost:5432/spacebar";
        const { Message } = await import("./Message.js");
        const { NewUrlUserSignatureData } = await import("../Signing.js");

        const imageUrl = "https://cdn.example/attachments/channel-id/message-id/image.png";
        const thumbnailUrl = "https://cdn.example/attachments/channel-id/message-id/thumb.png";
        const footerUrl = "https://cdn.example/attachments/channel-id/message-id/footer.png";
        const authorUrl = "https://cdn.example/attachments/channel-id/message-id/author.png";
        const galleryUrl = "https://cdn.example/attachments/channel-id/message-id/gallery.png";
        const galleryProxyUrl = "https://cdn.example/attachments/channel-id/message-id/gallery-proxy.png";
        const publicAttachmentUrl = "https://cdn.example/attachments/channel-id/message-id/top-level.png";
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

        const signed = Message.prototype.withSignedAttachments.call(
            message,
            new NewUrlUserSignatureData({
                ip: "203.0.113.10",
                userAgent: "test-agent",
            }),
        ) as {
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
});
