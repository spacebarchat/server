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

import { SKUPremiumPriceSchema } from "./SKUPremiumPriceSchema";

export interface SKUPriceSchema {
    /**
     * The lower-cased ISO 4217 currency code
     */
    currency: string;
    /**
     * The exponent to convert the amount to the displayed currency unit
     */
    currency_exponent: number;
    /**
     * The price amount in the smallest currency unit
     */
    amount: number;
    /**
     * The sale price amount in the smallest currency unit
     */
    sale_amount?: number;
    /**
     * The percentage discount of the sale price
     */
    sale_percentage?: number;
    /**
     * The price for premium users per premium type
     */
    premium?: Record<number, SKUPremiumPriceSchema>;
}
