export type MessageHistoryOrder = {
    id: "ASC" | "DESC";
};

type MessageLike = {
    id: string;
};

export function getMessageHistoryQueryOrder(options: { after?: string }): MessageHistoryOrder {
    if (options.after) return { id: "ASC" };
    return { id: "DESC" };
}

export function compareMessagesNewestFirst(a: MessageLike, b: MessageLike) {
    const left = BigInt(a.id);
    const right = BigInt(b.id);

    if (left === right) return 0;
    return left > right ? -1 : 1;
}

export function sortMessagesNewestFirst<T extends MessageLike>(messages: T[]) {
    return messages.sort(compareMessagesNewestFirst);
}
