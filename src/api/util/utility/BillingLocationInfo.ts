import { BillingLocationInfoResponse } from "@spacebar/schemas";

export interface LocationInfoSource {
    country_code?: string;
    region_code?: string;
}

export function createBillingLocationInfoResponse(locationInfo: LocationInfoSource | null | undefined): BillingLocationInfoResponse {
    return {
        ...(locationInfo?.country_code ? { country_code: locationInfo.country_code } : {}),
        ...(locationInfo?.region_code ? { subdivision_code: locationInfo.region_code } : {}),
    };
}
