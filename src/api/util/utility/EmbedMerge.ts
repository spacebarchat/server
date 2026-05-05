import type { Embed } from "@spacebar/schemas";

const embedsEqual = (first: Embed[], second: Embed[]) => JSON.stringify(first) === JSON.stringify(second);

export function mergeGeneratedUrlEmbeds(existingEmbeds: Embed[], generatedEmbeds: Embed[], maxEmbeds: number) {
    const nextEmbeds = existingEmbeds.filter((embed) => embed.type === "rich");
    const remainingEmbedSlots = Math.max(maxEmbeds - nextEmbeds.length, 0);
    nextEmbeds.push(...generatedEmbeds.slice(0, remainingEmbedSlots));

    return {
        changed: !embedsEqual(existingEmbeds, nextEmbeds),
        embeds: nextEmbeds,
    };
}
