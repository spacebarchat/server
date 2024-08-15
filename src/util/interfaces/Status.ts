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

export type Status = "idle" | "dnd" | "online" | "offline" | "invisible";

export interface ClientStatus {
	desktop?: string; // e.g. Windows/Linux/Mac
	mobile?: string; // e.g. iOS/Android
	web?: string; // e.g. browser, bot account, unknown
	embedded?: string; // e.g. embedded
}
