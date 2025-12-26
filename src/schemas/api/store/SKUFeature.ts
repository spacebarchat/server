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

export enum SKUFeature {
    /**
     * Single player game
     *
     * Value: 1
     * Name: SINGLE_PLAYER
     */
    SINGLE_PLAYER = 1,
    /**
     * Online multiplayer game
     *
     * Value: 2
     * Name: ONLINE_MULTIPLAYER
     */
    ONLINE_MULTIPLAYER = 2,
    /**
     * Local multiplayer game
     *
     * Value: 3
     * Name: LOCAL_MULTIPLAYER
     */
    LOCAL_MULTIPLAYER = 3,
    /**
     * Player versus player game
     *
     * Value: 4
     * Name: PVP
     */
    PVP = 4,
    /**
     * Local cooperative multiplayer
     *
     * Value: 5
     * Name: LOCAL_COOP
     */
    LOCAL_COOP = 5,
    /**
     * Cross-platform play supported
     *
     * Value: 6
     * Name: CROSS_PLATFORM
     */
    CROSS_PLATFORM = 6,
    /**
     * Rich presence integration
     *
     * Value: 7
     * Name: RICH_PRESENCE
     */
    RICH_PRESENCE = 7,
    /**
     * Discord game invites supported
     *
     * Value: 8
     * Name: DISCORD_GAME_INVITES
     */
    DISCORD_GAME_INVITES = 8,
    /**
     * Spectator mode supported
     *
     * Value: 9
     * Name: SPECTATOR_MODE
     */
    SPECTATOR_MODE = 9,
    /**
     * Controller support
     *
     * Value: 10
     * Name: CONTROLLER_SUPPORT
     */
    CONTROLLER_SUPPORT = 10,
    /**
     * Cloud saves supported
     *
     * Value: 11
     * Name: CLOUD_SAVES
     */
    CLOUD_SAVES = 11,
    /**
     * Online cooperative multiplayer
     *
     * Value: 12
     * Name: ONLINE_COOP
     */
    ONLINE_COOP = 12,
    /**
     * Secure networking supported
     *
     * Value: 13
     * Name: SECURE_NETWORKING
     */
    SECURE_NETWORKING = 13,
}
