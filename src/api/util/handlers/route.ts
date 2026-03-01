/*
    Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
    Copyright (C) 2023 Spacebar and Spacebar Contributors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { DiscordApiErrors, EVENT, FieldErrors, PermissionResolvable, Permissions, RightResolvable, Rights, SpacebarApiErrors, getPermission, getRights } from "@spacebar/util";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

declare global {
    // TODO: fix this
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            permission?: Permissions;
        }
    }
}

export type RouteResponse = {
    status?: number;
    body?: `${string}Response`;
    headers?: { [key: string]: string };
};

export interface RouteOptions {
    permission?: PermissionResolvable;
    right?: RightResolvable;
    requestBody?: z.ZodType;
    responses?: {
        [status: number]: {
            body?: string;
        };
    };
    event?: EVENT | EVENT[];
    summary?: string;
    description?: string;
    query?: {
        [key: string]: {
            type: string;
            required?: boolean;
            description?: string;
            values?: string[];
        };
    };
    deprecated?: boolean;
    spacebarOnly?: boolean;
}

export function route(opts: RouteOptions) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (opts.permission) {
            const { guild_id, channel_id } = req.params as { [key: string]: string };
            req.permission = await getPermission(req.user_id, guild_id, channel_id);

            const requiredPerms = Array.isArray(opts.permission) ? opts.permission : [opts.permission];
            requiredPerms.forEach((perm) => {
                if (!req.permission!.has(new Permissions(perm))) {
                    throw DiscordApiErrors.MISSING_PERMISSIONS.withParams(perm as string);
                }
            });
        }

        if (opts.right) {
            const required = new Rights(opts.right);
            req.rights = await getRights(req.user_id);

            if (!req.rights || !req.rights.has(required)) {
                throw SpacebarApiErrors.MISSING_RIGHTS.withParams(opts.right as string);
            }
        }

        if (opts.requestBody) {
            const result = opts.requestBody.safeParse(req.body);
            if (!result.success) {
                const fields: Record<string, { code?: string; message: string }> = {};
                result.error.issues.forEach((x: z.core.$ZodIssue) => {
                    fields[x.path.join(".")] = {
                        code: x.code,
                        message: x.message,
                    };
                });
                if (process.env.LOG_VALIDATION_ERRORS) console.log(`[VALIDATION ERROR] ${req.method} ${req.originalUrl} -`, z.treeifyError(result.error));
                throw FieldErrors(fields);
            }
            req.body = result.data;
        }
        next();
    };
}
