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
import { ShopBlockType } from "./ShopBlockType";

export interface CountdownTimerShopBlockSchema {
    /**
     * The shop block type
     */
    type: ShopBlockType;
    /**
     * The title of the countdown timer
     */
    title: string;
    /**
     * The body text of the countdown timer
     */
    body: string;
    /**
     * The URL of the countdown timer banner
     */
    banner_url: string;
    /**
     * The end time of the countdown timer
     */
    end_time: string;
    /**
     * The hex color code of the text
     */
    text_color: string;
}
