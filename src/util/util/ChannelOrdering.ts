export function normalizeChannelOrdering(channelOrdering: string[] | null | undefined) {
    return channelOrdering ?? [];
}

export function insertChannelInOrdering(channelOrdering: string[] | null | undefined, channelId: string, insertPoint: string | number) {
    const ordering = normalizeChannelOrdering(channelOrdering).filter((id) => id !== channelId);
    const position = typeof insertPoint === "string" ? ordering.indexOf(insertPoint) + 1 : insertPoint;
    const boundedPosition = Math.max(0, Math.min(position, ordering.length));

    ordering.splice(boundedPosition, 0, channelId);

    return { ordering, position: boundedPosition };
}

export function removeChannelOrderingFromGuildSave<T extends { channel_ordering?: string[] | null | undefined }>(guild: T) {
    delete guild.channel_ordering;
    return guild;
}
