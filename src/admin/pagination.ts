export interface Page {
    limit: number;
    offset: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function firstQueryValue(value: unknown): string | undefined {
    if (Array.isArray(value)) return firstQueryValue(value[0]);
    return typeof value === "string" ? value : undefined;
}

function parseInteger(value: unknown, fallback: number) {
    const raw = firstQueryValue(value);
    if (!raw) return fallback;

    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function parsePagination(query: Record<string, unknown>): Page {
    const limit = Math.min(Math.max(parseInteger(query.limit, DEFAULT_LIMIT), 1), MAX_LIMIT);
    const offset = Math.max(parseInteger(query.offset, 0), 0);

    return { limit, offset };
}

export function parseQueryString(value: unknown): string | undefined {
    const raw = firstQueryValue(value)?.trim();
    return raw ? raw : undefined;
}

export function parseBooleanQuery(value: unknown, fallback = false): boolean {
    const raw = firstQueryValue(value)?.toLowerCase();
    if (!raw) return fallback;

    return ["1", "true", "yes", "on"].includes(raw);
}

export function paginated<T>(
    items: T[],
    total: number,
    page: Page,
): {
    items: T[];
    pagination: {
        limit: number;
        offset: number;
        total: number;
    };
} {
    return {
        items,
        pagination: {
            limit: page.limit,
            offset: page.offset,
            total,
        },
    };
}
