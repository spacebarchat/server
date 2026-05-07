import type { Region } from "@spacebar/schemas";

type StreamRegionConfiguration = {
    default: string;
    available: Region[];
};

export function selectStreamRegion(regions: StreamRegionConfiguration, preferredRegion?: string): Region {
    const preferred = preferredRegion ? regions.available.find((region) => region.id === preferredRegion) : undefined;
    const fallback = regions.available.find((region) => region.id === regions.default);

    if (!preferred && !fallback) {
        throw new Error("No default region configured");
    }

    return preferred ?? fallback!;
}
