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

/**
 * [Distributor Type](https://docs.discord.food/resources/application#distributor-type)
 *
 * FIELD	TYPE	DESCRIPTION
 *
 * id	?string	The ID of the game
 *
 * sku	?string	The SKU of the game
 *
 * distributor	string	The [distributor](https://docs.discord.food/resources/application#distributor-type) of the game
 *
 * TypeScript
 */
export enum ApplicationSKUDistributor {
    /**
     * Discord Store
     *
     * Value: discord
     */
    discord,
    /**
     * Steam
     *
     * Value: steam
     */
    steam,
    /**
     * Twitch
     *
     * Value: twitch
     */
    twitch,
    /**
     * Ubisoft Connect
     *
     * Value: uplay
     */
    uplay,
    /**
     * Battle.net
     *
     * Value: battlenet
     */
    battlenet,
    /**
     * Origin
     *
     * Value: origin
     */
    origin,
    /**
     * GOG.com
     *
     * Value: gog
     */
    gog,
    /**
     * Epic Games Store
     *
     * Value: epic
     */
    epic,
    /**
     * Microsoft Store
     *
     * Value: microsoft
     */
    microsoft,
    /**
     * IGDB.com
     *
     * Value: igdb
     */
    igdb,
    /**
     * Glyph.net
     *
     * Value: glyph
     */
    glyph,
    /**
     * Google Play Store
     *
     * Value: google_play
     */
    google_play,
    /**
     * NVIDIA Cloud Gaming
     *
     * Value: nvidia_gdn_app
     */
    nvidia_gdn_app,
    /**
     * Gameopedia
     *
     * Value: gop
     */
    gop,
}
