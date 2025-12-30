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

export enum StoreListingIconType {
    /**
     * Icon is a store asset
     *
     * Value: 1
     * Name: STORE_ASSET
     */
    STORE_ASSET = 1,
    /**
     * Icon is a unicode emoji
     *
     * Value: 2
     * Name: EMOJI
     */
    EMOJI = 2,
}

export interface StoreListingIconSchema {
    /**
     * The type of icon
     */
    type: StoreListingIconType;
    /**
     * The store asset ID for the icon
     */
    store_asset_id: string;
    /**
     * The unicode emoji for the icon
     */
    emoji: string;
}
