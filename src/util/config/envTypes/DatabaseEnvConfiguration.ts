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

export class DatabaseEnvConfiguration {
	get unsafeSchemaSync(): boolean {
		if (process.env.DB_UNSAFE_SCHEMA_SYNC !== undefined) {
			return process.env.DB_UNSAFE_SCHEMA_SYNC === "true";
		}

		if (process.env.DB_SYNC !== undefined) {
			console.warn("[EnvConfig] DB_SYNC is deprecated. Please use DB_UNSAFE_SCHEMA_SYNC instead.");
			return process.env.DB_SYNC === "true";
		}

		return false;
	}

	get disableJoins(): boolean {
		if (process.env.DB_DISABLE_JOINS !== undefined) {
			return process.env.DB_DISABLE_JOINS === "true";
		}

		if (process.env.DB_NO_JOINS !== undefined) {
			console.warn("[EnvConfig] DB_NO_JOINS is deprecated. Please use DB_DISABLE_JOINS instead.");
			return process.env.DB_NO_JOINS === "true";
		}

		return false;
	}
}
