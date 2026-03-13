/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

export class OffloadConfiguration {
    gateway: GatewayOffloadConfiguration = new GatewayOffloadConfiguration();
}

export class GatewayOffloadConfiguration {
    guildMembersUrl: string | null = null; // op8
    guildSyncUrl: string | null = null; // op12
    lazyRequestUrl: string | null = null; // op14
    channelStatusesUrl: string | null = null; //op36
    channelInfoUrl: string | null = null; //op43
}
