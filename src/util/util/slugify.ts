export function slugify(text: string): string {
    // return as url friendly slug
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\\-]+/g, "")
        .replace(/\\-\\-+/g, "-");
}
