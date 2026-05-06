/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

export interface PaymentSourceBillingAddressResponse {
    name: string;
    line_1?: string;
    line_2?: string | null;
    city?: string;
    state?: string | null;
    country: string;
    postal_code?: string;
}

export interface PaymentSourceResponse {
    id: string;
    billing_address: PaymentSourceBillingAddressResponse;
    type: number;
    payment_gateway: number;
    default: boolean;
    invalid: boolean;
    flags: number;
    brand?: string | null;
    country?: string;
    last_4?: string | null;
    payment_gateway_source_id?: string;
    deleted_at?: string | null;
    expires_month?: number;
    expires_year?: number;
    email?: string;
    bank?: string;
    username?: string;
}

export type PaymentSourcesResponse = PaymentSourceResponse[];
