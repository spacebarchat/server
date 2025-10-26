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
import { CdnEnvConfiguration } from "./envTypes/CdnEnvConfiguration";
import { WebRtcEnvConfiguration } from "./envTypes/WebRtcEnvConfiguration";

const logConfig = new LogEnvConfiguration();
const databaseConfig = new DatabaseEnvConfiguration();
const configurationConfig = new ConfigurationEnvConfiguration();
const cdnConfig = new CdnEnvConfiguration();
const webrtcConfig = new WebRtcEnvConfiguration();

export class EnvConfig {
	private static _instance: EnvConfig;
	static get() {
		if (!this._instance) this._instance = new EnvConfig();
		return this._instance;
	}

	static schema() {
		return [
			{ key: "THREADS", type: "number", description: "Number of threads to use for the server. Defaults to number of CPU cores." },
			{ key: "PORT", type: "number", description: "Port to run the server on." },
			{ key: "FORCE_KITTY_LOGO", type: "boolean", description: "Force enable/disable KiTTY logo support in terminal." },
			...LogEnvConfiguration.schema,
			...DatabaseEnvConfiguration.schema,
			...ConfigurationEnvConfiguration.schema,
			...CdnEnvConfiguration.schema,
			...WebRtcEnvConfiguration.schema,
		];
	}

	get logging(): LogEnvConfiguration {
		return logConfig;
	}

	get database(): DatabaseEnvConfiguration {
		return databaseConfig;
	}

	get configuration(): ConfigurationEnvConfiguration {
		return configurationConfig;
	}

	get cdn(): CdnEnvConfiguration {
		return cdnConfig;
	}

	get webrtc(): WebRtcEnvConfiguration {
		return webrtcConfig;
	}

	get threads(): number {
		try {
			return Number(process.env.THREADS) || os.cpus().length;
		} catch {
			console.log("[EnvConfig] Failed to get thread count! Using 1...");
			return 1;
		}
	}

	get port(): number | undefined {
		return Number(process.env.PORT);
	}

	get forceKiTTYLogo(): boolean | undefined {
		if (process.env.FORCE_KITTY_LOGO !== undefined) {
			return process.env.FORCE_KITTY_LOGO === "true";
		}
		return undefined;
	}

	get terminalEmulator(): string | undefined {
		return process.env.TERM;
	}

	get eventTransmission(): string | undefined {
		return process.env.EVENT_TRANSMISSION;
	}
}

// Deprecations:
if (process.env.GATEWAY) console.warn("[EnvConfig] GATEWAY is deprecated and no longer does anything. Please configure cdn_endpointPublic in configuration instead.");
if (process.env.CDN) console.warn("[EnvConfig] CDN is deprecated and no longer does anything. Please configure cdn_endpointPublic in configuration instead.");
