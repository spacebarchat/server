import { ReactionType } from "@spacebar/util";

export function parseReactionTypeParam(value: string): ReactionType | null {
    if (value === String(ReactionType.normal)) return ReactionType.normal;
    if (value === String(ReactionType.burst)) return ReactionType.burst;
    return null;
}
