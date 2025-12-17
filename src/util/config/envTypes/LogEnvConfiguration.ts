/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
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

import { arrayOrderBy } from "@spacebar/util";

interface GatewayLoggingConfigValue {
	enabled: boolean;
	logTraces: boolean;
	logUserId: boolean;
	logSessionId: boolean;
	logPayload: boolean;
	logHttp: boolean;
	logHttpMessages: boolean;
}

export class LogEnvConfiguration {
	static get schema() {
		return arrayOrderBy([
			{ key: "LOG_CDN_SIGNATURES", type: "boolean", description: "Log CDN attachment signature checks - very noisy!" },
			{ key: "LOG_DATABASE_QUERIES", type: "boolean", description: "Enable logging of database queries." },
			{ key: "LOG_GATEWAY_EVENTS", type: "boolean", description: "Comma-separated list of flags. Any of: `TRACES`, `USER_ID`, `SESSION_ID`, `PAYLOAD`, `HTTP`, `HTTP_MESSAGES`." },
			{ key: "LOG_WEBRTC_EVENTS", type: "boolean", description: "Comma-separated list of flags. Any of: `TRACES`, `USER_ID`, `SESSION_ID`, `PAYLOAD`, `HTTP`, `HTTP_MESSAGES`." },
			{ key: "DUMP_GATEWAY_EVENT_PATH", type: "string", description: "Path to dump gateway events." },
			{ key: "DUMP_WEBRTC_EVENT_PATH", type: "string", description: "Path to dump gateway events." },
			{ key: "LOG_PROTO_UPDATES", type: "boolean or string", description: "`true`, or a list of proto schemas to log (`SETTINGS`, `FRECENCY`)" },
			{
				key: "LOG_REQUESTS",
				type: "string",
				description: "Comma-separated list of requests to log by status code. Negated with a leading `-`. Example: `-204` (log everything except 204 No Content)",
			},
			{ key: "LOG_AUTHENTICATION", type: "boolean", description: "Log authentication debug messages - very noisy!" },
			{ key: "LOG_VALIDATION_ERRORS", type: "boolean", description: "Enable logging of validation errors." },
			{ key: "LOG_IMPORT_ERRORS", type: "boolean", description: "Enable logging of import errors." },
		], (e) => e.key);
	}

	get gatewayLogging(): GatewayLoggingConfigValue {
		const logDeprecated = (oldName: string, newName: string): string | undefined => {
			if (process.env[oldName] !== undefined) {
				console.warn(`[EnvConfig] ${oldName} is deprecated. Please use ${newName} instead.`);
				return process.env[oldName];
			}
			return undefined;
		};

		const envVal = process.env.LOG_GATEWAY_EVENTS?.split(",");

		const ret: GatewayLoggingConfigValue = {
			enabled: envVal !== undefined || logDeprecated("WS_LOGEVENTS", "LOG_GATEWAY_EVENTS") === "true",
			logTraces: envVal?.includes("TRACES") || logDeprecated("LOG_GATEWAY_TRACES", "LOG_GATEWAY_EVENTS=TRACES") === "true",
			logUserId: envVal?.includes("USER_ID") ?? false,
			logSessionId: envVal?.includes("SESSION_ID") ?? false,
			logPayload:
				envVal?.includes("PAYLOAD") ||
				logDeprecated("LOG_GATEWAY_EVENT_CONTENT", "LOG_GATEWAY_EVENTS=PAYLOAD") === "true" ||
				logDeprecated("WS_VERBOSE", "LOG_GATEWAY_EVENTS=PAYLOAD") === "true",
			logHttp: envVal?.includes("HTTP") ?? false,
			logHttpMessages: envVal?.includes("HTTP_MESSAGES") ?? false,
		};

		if (!ret.enabled) {
			ret.enabled = ret.logTraces || ret.logPayload; // enable if deprecated properties are set
		}

		return ret;
	}

	get webrtcLogging(): GatewayLoggingConfigValue {
		const logDeprecated = (oldName: string, newName: string): string | undefined => {
			if (process.env[oldName] !== undefined) {
				console.warn(`[EnvConfig] ${oldName} is deprecated. Please use ${newName} instead.`);
				return process.env[oldName];
			}
			return undefined;
		};

		const envVal = process.env.LOG_WEBRTC_EVENTS?.split(",");

		const ret: GatewayLoggingConfigValue = {
			enabled: envVal !== undefined || logDeprecated("WRTC_LOGEVENTS", "LOG_WEBRTC_EVENTS") === "true",
			logTraces: envVal?.includes("TRACES") || logDeprecated("LOG_WEBRTC_TRACES", "LOG_WEBRTC_EVENTS=TRACES") === "true",
			logUserId: envVal?.includes("USER_ID") ?? false,
			logSessionId: envVal?.includes("SESSION_ID") ?? false,
			logPayload:
				envVal?.includes("PAYLOAD") ||
				logDeprecated("WRTC_WS_VERBOSE", "LOG_WEBRTC_EVENTS=PAYLOAD") === "true",
			logHttp: envVal?.includes("HTTP") ?? false,
			logHttpMessages: envVal?.includes("HTTP_MESSAGES") ?? false,
		};

		if (!ret.enabled) {
			ret.enabled = ret.logTraces || ret.logPayload; // enable if deprecated properties are set
		}

		return ret;
	}

	get dumpGatewayEventPath(): string | undefined {
		if(process.env.DUMP_GATEWAY_EVENT_PATH !== undefined) return process.env.DUMP_GATEWAY_EVENT_PATH;
		if (process.env.WS_DUMP !== undefined) {
			console.warn("[EnvConfig] WS_DUMP is deprecated. Please use DUMP_GATEWAY_EVENT_PATH=./dump instead.");
			return process.env.WS_DUMP ? "dump" : undefined;
		}
	}

	get dumpWebrtcEventPath(): string | undefined {
		if(process.env.DUMP_WEBRTC_EVENT_PATH !== undefined) return process.env.DUMP_WEBRTC_EVENT_PATH;
		if (process.env.WRTC_DUMP !== undefined) {
			console.warn("[EnvConfig] WRTC_DUMP is deprecated. Please use DUMP_WEBRTC_EVENT_PATH=./dump_wrtc instead.");
			return process.env.WRTC_DUMP ? "dump_wrtc" : undefined;
		}
	}

	get logDatabaseQueries(): boolean {
		if (process.env.LOG_DATABASE_QUERIES === "true") return true;
		if (process.env.DB_LOGGING !== undefined) {
			console.warn("[EnvConfig] DB_LOGGING is deprecated. Please use LOG_DATABASE_QUERIES instead.");
			return process.env.DB_LOGGING === "true";
		}
		return false;
	}

	get logRequests(): string {
		return process.env.LOG_REQUESTS || "";
	}

	get logValidationErrors(): boolean {
		return process.env.LOG_VALIDATION_ERRORS === "true";
	}

	get logProtoUpdates(): string[] {
		if (process.env.LOG_PROTO_UPDATES === "true") return ["FRECENCY", "SETTINGS"];
		return (process.env.LOG_PROTO_UPDATES || "")
			.split(",")
			.map((s) => s.trim().toUpperCase())
			.filter((s) => s.length > 0);
	}

	get logAuthentication(): boolean {
		return process.env.LOG_AUTHENTICATION === "true";
	}

	get logCdnSignatures(): boolean {
		return process.env.LOG_CDN_SIGNATURES === "true";
	}

	get logImportErrors(): boolean {
		return process.env.LOG_IMPORT_ERRORS === "true";
	}
}
