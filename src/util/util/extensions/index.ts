export * from "./Array";

// TODO: move to a separate file
export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
