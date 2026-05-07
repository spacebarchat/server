import { cookies, headers } from "next/headers";

export class AdminApiError extends Error {
    constructor(
        message: string,
        public status: number,
    ) {
        super(message);
    }
}

export interface AdminApiResult<T> {
    data: T | null;
    error: string | null;
}

function adminApiBase() {
    return (process.env.SPACEBAR_ADMIN_API_URL ?? "http://localhost:3001/_spacebar/admin/api").replace(/\/+$/, "");
}

export async function getAuthorizationHeader() {
    const headerStore = await headers();
    const cookieStore = await cookies();
    const forwarded = headerStore.get("authorization");
    const cookieToken = cookieStore.get("spacebar_admin_token")?.value ?? cookieStore.get("spacebar_token")?.value;
    const token = forwarded ?? cookieToken;

    if (!token) return null;
    return token.startsWith("Bearer ") || token.startsWith("Bot ") ? token : `Bearer ${token}`;
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const authorization = await getAuthorizationHeader();
    if (!authorization) throw new AdminApiError("Missing admin token", 401);
    const timeout = Number(process.env.SPACEBAR_ADMIN_API_TIMEOUT_MS ?? 2500);

    const response = await fetch(`${adminApiBase()}${path}`, {
        ...init,
        cache: "no-store",
        signal: init.signal ?? AbortSignal.timeout(timeout),
        headers: {
            accept: "application/json",
            authorization,
            ...(init.body ? { "content-type": "application/json" } : {}),
            ...init.headers,
        },
    });

    if (!response.ok) {
        let message = `${response.status} ${response.statusText}`;
        try {
            const body = (await response.json()) as { message?: string };
            if (body.message) message = body.message;
        } catch {
            // Keep the HTTP status text.
        }
        throw new AdminApiError(message, response.status);
    }

    if (response.status === 204) return null as T;
    return (await response.json()) as T;
}

export async function safeAdminFetch<T>(path: string): Promise<AdminApiResult<T>> {
    try {
        return { data: await adminFetch<T>(path), error: null };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

export function queryString(params: Record<string, string | number | boolean | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") search.set(key, String(value));
    }
    const value = search.toString();
    return value ? `?${value}` : "";
}
