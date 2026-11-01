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

import { Snowflake } from "@spacebar/schemas";

export type PaymentSourceListResponse = PaymentSource[];
export interface PaymentSource {
    id: Snowflake;
    brand?: string;
    country?: string;
    last_4?: string;
    billing_address: BillingAddress;
    type: PaymentSourceType;
    payment_gateway: PaymentGateway;
    payment_gateway_source_id?: string;
    default: boolean;
    invalid: boolean;
    flags: PaymentSourceFlags;
    deleted_at: string | null;
    expires_month?: number;
    expires_year?: number;
    email?: string;
    bank?: string;
    username?: string;
}

export interface BillingAddress {
    line_1: string;
    line_2?: string | null;
    name: string;
    postal_code?: string;
    city: string;
    state?: string;
    country: string;
}
export enum PaymentSourceType {
    CARD = 1,
    PAYPAL = 2,
    GIROPAY = 3,
    SOFORT = 4,
    PRZELEWY24 = 5,
    SEPA_DEBIT = 6,
    PAYSAFE_CARD = 7,
    GCASH = 8,
    GRABPAY_MY = 9,
    MOMO_WALLET = 10,
    VENMO = 11,
    GOPAY_WALLET = 12,
    KAKAOPAY = 13,
    BANCONTACT = 14,
    EPS = 15,
    IDEAL = 16,
    CASH_APP = 17,
    APPLE = 18,
    TDS_WALLET = 19,
}

export enum PaymentGateway {
    STRIPE = 1,
    BRAINTREE = 2,
    APPLE = 3,
    GOOGLE = 4,
    ADYEN = 5,
    APPLE_PARTNER = 6,
    AMAZON = 7,
    VIRTUAL_CURRENCY = 8,
    APPLE_ADVANCED_COMMERCE = 9,
    TDS = 10,
}

export enum PaymentSourceFlags {
    NEW = 1 << 0,
    SUCCESSFUL_PAYMENT = 1 << 1,
}
