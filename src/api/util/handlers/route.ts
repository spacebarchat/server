/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import {
	ajv,
	DiscordApiErrors,
	EVENT,
	FieldErrors,
	FosscordApiErrors,
	getPermission,
	getRights,
	normalizeBody,
	PermissionResolvable,
	Permissions,
	RightResolvable,
	Rights,
} from "@fosscord/util";
import { AnyValidateFunction } from "ajv/dist/core";
import { NextFunction, Request, Response } from "express";

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
	headers?: Record<string, string>;
};

export interface RouteOptions {
	permission?: PermissionResolvable;
	right?: RightResolvable;
	requestBody?: `${string}Schema`; // typescript interface name
	responses?: {
		[status: number]: {
			// body?: `${string}Response`;
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
	// test?: {
	// 	response?: RouteResponse;
	// 	body?: unknown;
	// 	path?: string;
	// 	event?: EVENT | EVENT[];
	// 	headers?: Record<string, string>;
	// };
}

export function route(opts: RouteOptions) {
	let validate: AnyValidateFunction | undefined;
	if (opts.requestBody) {
		validate = ajv.getSchema(opts.requestBody);
		if (!validate)
			throw new Error(`Body schema ${opts.requestBody} not found`);
	}

	return async (req: Request, res: Response, next: NextFunction) => {
		if (opts.permission) {
			const required = new Permissions(opts.permission);
			req.permission = await getPermission(
				req.user_id,
				req.params.guild_id,
				req.params.channel_id,
			);

			// bitfield comparison: check if user lacks certain permission
			if (!req.permission.has(required)) {
				throw DiscordApiErrors.MISSING_PERMISSIONS.withParams(
					opts.permission as string,
				);
			}
		}

		if (opts.right) {
			const required = new Rights(opts.right);
			req.rights = await getRights(req.user_id);

			if (!req.rights || !req.rights.has(required)) {
				throw FosscordApiErrors.MISSING_RIGHTS.withParams(
					opts.right as string,
				);
			}
		}

		if (validate) {
			const valid = validate(normalizeBody(req.body));
			if (!valid) {
				const fields: Record<
					string,
					{ code?: string; message: string }
				> = {};
				validate.errors?.forEach(
					(x) =>
						(fields[x.instancePath.slice(1)] = {
							code: x.keyword,
							message: x.message || "",
						}),
				);
				throw FieldErrors(fields);
			}
		}
		next();
	};
}
