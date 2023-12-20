/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

export interface UpdatesResponse {
	/**
	 * Version to install.
	 * Tauri Specific
	 */
	version: string;
	/**
	 * The latest host version.
	 */
	name: string;
	/**
	 * When the update was published
	 */
	pub_date: string;
	/**
	 * The URL to the corresponding installer.
	 * Only provided if auto updates are available for the selected platform.
	 */
	url: string | null;
	/**
	 * Any extra notes for the update
	 * Only provided if auto updates are available for the selected platform.
	 */
	notes: string | null;
	/**
	 * The signature of the update.
	 * Tauri Specific
	 */
	signature: string | null;
}
