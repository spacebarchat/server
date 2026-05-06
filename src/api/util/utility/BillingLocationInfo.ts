import { BillingLocationInfoResponse } from "@spacebar/schemas";

export interface LocationInfoSource {
    country_code?: string;
    region_code?: string;
}

function createSubdivisionCode(locationInfo: LocationInfoSource | null | undefined) {
    if (!locationInfo?.country_code || !locationInfo.region_code) return undefined;
    if (locationInfo.region_code.includes("-")) return locationInfo.region_code;

    return `${locationInfo.country_code}-${locationInfo.region_code}`;
}

export function createBillingLocationInfoResponse(locationInfo: LocationInfoSource | null | undefined): BillingLocationInfoResponse {
    const subdivisionCode = createSubdivisionCode(locationInfo);

    return {
        // Preserve the pre-schema route contract: missing IpData country data serializes as an empty JSON object.
        ...(locationInfo?.country_code ? { country_code: locationInfo.country_code } : {}),
        ...(subdivisionCode ? { subdivision_code: subdivisionCode } : {}),
    };
}
