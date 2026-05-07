import { Rights } from "@spacebar/util";
import { NextFunction, Request, Response } from "express";
import { HTTPError } from "lambert-server";
import { authenticateRequestToken } from "../../api/middlewares/Authentication";

export type AdminRequestAuthenticator = (req: Request, res: Response) => Promise<void>;

export function createAdminAuthentication(authenticate: AdminRequestAuthenticator = authenticateRequestToken) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method === "OPTIONS") return res.sendStatus(204);

        try {
            await authenticate(req, res);

            if (!req.rights?.has(new Rights("OPERATOR"))) {
                throw new HTTPError("Missing OPERATOR rights", 403);
            }

            return next();
        } catch (error) {
            return next(error);
        }
    };
}

export const AdminAuthentication = createAdminAuthentication();
