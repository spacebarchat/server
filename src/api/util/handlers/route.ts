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
import { NextFunction, Request, Response } from "express";
import { AnyValidateFunction } from "ajv/dist/core";

declare global {
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
	body?: `${string}Schema`; // typescript interface name
	test?: {
		response?: RouteResponse;
		body?: any;
		path?: string;
		event?: EVENT | EVENT[];
		headers?: Record<string, string>;
	};
}

export function route(opts: RouteOptions) {
	let validate: AnyValidateFunction<any> | undefined;
	if (opts.body) {
		validate = ajv.getSchema(opts.body);
		if (!validate) throw new Error(`Body schema ${opts.body} not found`);
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
