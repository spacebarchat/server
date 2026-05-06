export interface CategoryLocalizations {
    [locale: string]: string;
}

export function normalizeCategoryLocalizations(value: unknown): CategoryLocalizations {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return {};

    return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}
