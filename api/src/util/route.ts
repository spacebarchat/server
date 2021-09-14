import { DiscordApiErrors, Event, EventData, getPermission, PermissionResolvable, Permissions, Webhook } from "@fosscord/util";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import Ajv from "ajv";
import { AnyValidateFunction } from "ajv/dist/core";
import { FieldErrors } from "..";
import addFormats from "ajv-formats";

const SchemaPath = path.join(__dirname, "..", "..", "assets", "schemas.json");
const schemas = JSON.parse(fs.readFileSync(SchemaPath, { encoding: "utf8" }));
export const ajv = new Ajv({
	allErrors: true,
	parseDate: true,
	allowDate: true,
	schemas,
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

export type RouteSchema = string; // typescript interface name
export type RouteResponse = { status?: number; body?: RouteSchema; headers?: Record<string, string> };

export interface RouteOptions {
	permission?: PermissionResolvable;
	body?: RouteSchema;
	response?: RouteResponse;
	example?: {
		body?: any;
		path?: string;
		event?: EventData;
		headers?: Record<string, string>;
	};
}

export function route(opts: RouteOptions) {
	var validate: AnyValidateFunction<any>;
	if (opts.body) {
		// @ts-ignore
		validate = ajv.getSchema(opts.body);
		if (!validate) throw new Error(`Body schema ${opts.body} not found`);
	}

	return async (req: Request, res: Response, next: NextFunction) => {
		if (opts.permission) {
			const required = new Permissions(opts.permission);
			if (req.params.webhook_id) {
				const webhook = await Webhook.findOneOrFail({ id: req.params.webhook_id });
				req.params.channel_id = webhook.channel_id;
				req.params.guild_id = webhook.guild_id;
			}
			const permission = await getPermission(req.user_id, req.params.guild_id, req.params.channel_id);

			if (!permission.has(required)) {
				throw DiscordApiErrors.MISSING_PERMISSIONS.withParams(opts.permission as string);
			}

			if (validate) {
				const valid = validate(req.body);
				if (!valid) {
					const fields: Record<string, { code?: string; message: string }> = {};
					validate.errors?.forEach((x) => (fields[x.instancePath] = { code: x.keyword, message: x.message || "" }));
					throw FieldErrors(fields);
				}
			}
		}
		next();
	};
}
