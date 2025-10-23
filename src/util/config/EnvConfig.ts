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

import { LogEnvConfiguration } from "./envTypes/LogEnvConfiguration";
import { DatabaseEnvConfiguration } from "./envTypes/DatabaseEnvConfiguration";
import os from "os";
import { ConfigurationEnvConfiguration } from "./envTypes/ConfigurationEnvConfiguration";

export class EnvConfig {
	private static logConfig = new LogEnvConfiguration();
	private static databaseConfig = new DatabaseEnvConfiguration();
	private static configurationConfig = new ConfigurationEnvConfiguration();

	static get logging(): LogEnvConfiguration {
		return this.logConfig;
	}

	static get database(): DatabaseEnvConfiguration {
		return this.databaseConfig;
	}

	static get configuration(): ConfigurationEnvConfiguration {
		return this.configurationConfig;
	}

	static get threads(): number {
		try {
			return Number(process.env.THREADS) || os.cpus().length;
		} catch {
			console.log("[EnvConfig] Failed to get thread count! Using 1...");
			return 1;
		}
	}
}

// Deprecations:
if (process.env.GATEWAY) console.warn("[EnvConfig] GATEWAY is deprecated and no longer does anything. Please configure cdn_endpointPublic in configuration instead.");

if (process.env.CDN) console.warn("[EnvConfig] CDN is deprecated and no longer does anything. Please configure cdn_endpointPublic in configuration instead.");
