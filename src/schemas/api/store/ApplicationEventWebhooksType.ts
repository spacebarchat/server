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

export enum ApplicationEventWebhooksType {
    /**
     * Sent when a user authorizes the application
     *
     * Value: APPLICATION_AUTHORIZED
     */
    APPLICATION_AUTHORIZED,
    /**
     * Sent when a user deauthorizes the application
     *
     * Value: APPLICATION_DEAUTHORIZED
     */
    APPLICATION_DEAUTHORIZED,
    /**
     * Sent when a user creates an entitlement
     *
     * Value: ENTITLEMENT_CREATE
     */
    ENTITLEMENT_CREATE,
    /**
     * Sent when an entitlement is updated
     *
     * Value: ENTITLEMENT_UPDATE
     */
    ENTITLEMENT_UPDATE,
    /**
     * Sent when an entitlement is deleted
     *
     * Value: ENTITLEMENT_DELETE
     */
    ENTITLEMENT_DELETE,
    /**
     * Sent when a user enrolls in a quest
     *
     * Value: QUEST_USER_ENROLLMENT
     */
    QUEST_USER_ENROLLMENT,
    /**
     * Sent when a user sends a message in a lobby
     *
     * Value: LOBBY_MESSAGE_CREATE
     */
    LOBBY_MESSAGE_CREATE,
    /**
     * Sent when a user updates a message in a lobby
     *
     * Value: LOBBY_MESSAGE_UPDATE
     */
    LOBBY_MESSAGE_UPDATE,
    /**
     * Sent when a user deletes a message in a lobby
     *
     * Value: LOBBY_MESSAGE_DELETE
     */
    LOBBY_MESSAGE_DELETE,
    /**
     * Sent when a user sends a direct message through the social layer SDK
     *
     * Value: GAME_DIRECT_MESSAGE_CREATE
     */
    GAME_DIRECT_MESSAGE_CREATE,
    /**
     * Sent when a user updates a direct message through the social layer SDK
     *
     * Value: GAME_DIRECT_MESSAGE_UPDATE
     */
    GAME_DIRECT_MESSAGE_UPDATE,
    /**
     * Sent when a user deletes a direct message through the social layer SDK
     *
     * Value: GAME_DIRECT_MESSAGE_DELETE
     */
    GAME_DIRECT_MESSAGE_DELETE,
}
