import {
	DiscordApiErrors,
	EVENT,
	Event,
	EventData,
	FieldErrors,
	FosscordApiErrors,
	getPermission,
	PermissionResolvable,
	Permissions,
	RightResolvable,
	Rights
} from "@fosscord/util";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import Ajv from "ajv";
import { AnyValidateFunction } from "ajv/dist/core";
import addFormats from "ajv-formats";

const SchemaPath = path.join(__dirname, "..", "..", "assets", "schemas.json");
const schemas = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }));
export const ajv = new Ajv({
	allErrors: true,
	parseDate: true,
	allowDate: true,
	schemas,
	coerceTypes: true,
	messages: true,
	strict: true,
	strictRequired: true
});
addFormats(ajv);

declare global {
	namespace Express {
		interface Request {
			permission?: Permissions;
		}
	}
}

export type RouteResponse = { status?: number; body?: `${string}Response`; headers?: Record<string, string> };

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

// Normalizer is introduced to workaround https://github.com/ajv-validator/ajv/issues/1287
// this removes null values as ajv doesn't treat them as undefined
// normalizeBody allows to handle circular structures without issues
// taken from https://github.com/serverless/serverless/blob/master/lib/classes/ConfigSchemaHandler/index.js#L30 (MIT license)
const normalizeBody = (body: any = {}) => {
	const normalizedObjectsSet = new WeakSet();
	const normalizeObject = (object: any) => {
		if (normalizedObjectsSet.has(object)) return;
		normalizedObjectsSet.add(object);
		if (Array.isArray(object)) {
			for (const [index, value] of object.entries()) {
				if (typeof value === "object") normalizeObject(value);
			}
		} else {
			for (const [key, value] of Object.entries(object)) {
				if (value == null) {
					if (key === "icon" || key === "avatar" || key === "banner" || key === "splash") continue;
					delete object[key];
				} else if (typeof value === "object") {
					normalizeObject(value);
				}
			}
		}
	};
	normalizeObject(body);
	return body;
};

export function route(opts: RouteOptions) {
	var validate: AnyValidateFunction<any> | undefined;
	if (opts.body) {
		validate = ajv.getSchema(opts.body);
		if (!validate) throw new Error(`Body schema ${opts.body} not found`);
	}

	return async (req: Request, res: Response, next: NextFunction) => {
		if (opts.permission) {
			const required = new Permissions(opts.permission);
			req.permission = await getPermission(req.user_id, req.params.guild_id, req.params.channel_id);

			// bitfield comparison: check if user lacks certain permission
			if (!req.permission.has(required)) {
				throw DiscordApiErrors.MISSING_PERMISSIONS.withParams(opts.permission as string);
			}
		}

		if (opts.right) {
			const required = new Rights(opts.right);
			if (!req.rights || !req.rights.has(required)) {
				throw FosscordApiErrors.MISSING_RIGHTS.withParams(opts.right as string);
			}
		}

		if (validate) {
			const valid = validate(normalizeBody(req.body));
			if (!valid) {
				const fields: Record<string, { code?: string; message: string }> = {};
				validate.errors?.forEach((x) => (fields[x.instancePath.slice(1)] = { code: x.keyword, message: x.message || "" }));
				throw FieldErrors(fields);
			}
		}
		next();
	};
}
