import { WhoAmIResponse } from "@spacebar/schemas";
import { Request } from "express";

export function getWhoAmIResponse(req: Request): WhoAmIResponse {
    return {
        id: req.user_id,
        device_id: req.session?.session_id ?? null,
        flags: req.user?.flags ?? 0,
        rights: req.user?.rights ?? 0,
        logged_in_since: new Date(req.token.iat * 1000).toISOString(),
    };
}
