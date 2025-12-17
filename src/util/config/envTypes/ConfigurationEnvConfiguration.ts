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

export class ConfigurationEnvConfiguration {
	static get schema() {
		return arrayOrderBy([
			{ key: "CONFIG_PATH", type: "string", description: "Path to a JSON file containing configuration data" },
			{ key: "CONFIG_WRITEBACK", type: "boolean", description: "Whether to write back configuration changes to the specified JSON file" },
			{
				key: "CONFIG_MODE",
				type: "string",
				description:
					"How to treat the JSON config.<br/>" +
					"<ul>" +
					"<li>**`override`**: Apply overrides without saving</li>" +
					"<li>**`overwrite`**: Apply overrides, saving changes to the database</li>" +
					"<li>**`single`**: Ignore database config outright</li>" +
					"</ul>",
			},
		], (e) => e.key);
	}

	get enabled(): boolean {
		return process.env.CONFIG_PATH !== undefined;
	}

	get path(): string {
		if (process.env.CONFIG_PATH === undefined && this.enabled) {
			throw new Error("BUGBUG: enabled() determined that JSON config is enabled, but it is not?");
		}

		return process.env.CONFIG_PATH!;
	}

	get writebackEnabled(): boolean {
		if (process.env.CONFIG_WRITEBACK !== undefined) {
			return process.env.CONFIG_WRITEBACK === "true";
		}

		if (process.env.CONFIG_READONLY !== undefined) {
			console.warn("[EnvConfig] CONFIG_READONLY is deprecated. Please use CONFIG_WRITEBACK instead.");
			return process.env.CONFIG_READONLY !== "true";
		}

		return this.enabled;
	}

	/**
	 * Gets the configuration mode.
	 * - "override": Config file overrides settings at runtime
	 * - "overwrite": Config file overwrites database values at runtime
	 * - "single": Database is not used
	 */
	get mode(): "override" | "overwrite" | "single" {
		if (process.env.CONFIG_MODE === "override" || process.env.CONFIG_MODE === "overwrite" || process.env.CONFIG_MODE === "single") {
			return process.env.CONFIG_MODE;
		}

		return "override";
	}
}
