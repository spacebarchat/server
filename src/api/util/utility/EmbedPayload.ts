type EmbedPayload = {
    footer?: Record<string, unknown> | null;
};

type MessagePayloadWithEmbeds = {
    embed?: EmbedPayload | null;
    embeds?: EmbedPayload[] | null;
};

function normalizeEmbedFooter(embed: EmbedPayload) {
    const { footer } = embed;
    if (!footer || typeof footer !== "object" || Array.isArray(footer)) return;

    for (const [key, value] of Object.entries(footer)) {
        if (value === null || value === undefined) {
            delete footer[key];
        }
    }

    if (Object.keys(footer).length === 0) {
        delete embed.footer;
    }
}

export function normalizeEmbedPayload(payload: unknown) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;

    const messagePayload = payload as MessagePayloadWithEmbeds;
    if (messagePayload.embed && typeof messagePayload.embed === "object" && !Array.isArray(messagePayload.embed)) {
        normalizeEmbedFooter(messagePayload.embed);
    }

    if (!Array.isArray(messagePayload.embeds)) return;

    for (const embed of messagePayload.embeds) {
        if (embed && typeof embed === "object" && !Array.isArray(embed)) {
            normalizeEmbedFooter(embed);
        }
    }
}
