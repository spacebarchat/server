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

export class LogEnvConfiguration {
	get logGatewayEvents(): boolean {
		if (process.env.LOG_GATEWAY_EVENTS === "true") return true;
		if (process.env.WS_LOGEVENTS !== undefined) {
			console.warn("[EnvConfig] WS_LOGEVENTS is deprecated. Please use LOG_GATEWAY_EVENTS instead.");
			return process.env.WS_LOGEVENTS === "true";
		}
		return false;
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

	get logGatewayTraces(): boolean {
		return process.env.LOG_GATEWAY_TRACES === "true";
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
}
