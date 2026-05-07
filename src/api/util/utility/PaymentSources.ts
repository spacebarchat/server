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

import type { PaymentSourceResponse } from "@spacebar/schemas";
import type { Response } from "express";

const examplePaymentSource: PaymentSourceResponse = {
    id: "1422548914485198869",
    type: 1,
    invalid: false,
    flags: 2,
    deleted_at: null,
    brand: "visa",
    last_4: "4242",
    expires_month: 9,
    expires_year: 2077,
    billing_address: {
        name: "John Doe",
        line_1: "123 Main Street",
        line_2: "Apt 4B",
        city: "San Francisco",
        state: "CA",
        country: "US",
        postal_code: "94105",
    },
    country: "US",
    payment_gateway: 1,
    payment_gateway_source_id: "pm_DwiVlGlYwe1qxLzy4QWChQeo",
    default: false,
};

export function createPaymentSource(paymentSourceId = examplePaymentSource.id): PaymentSourceResponse {
    return {
        ...examplePaymentSource,
        id: paymentSourceId,
        billing_address: {
            ...examplePaymentSource.billing_address,
        },
    };
}

export function listPaymentSources(): PaymentSourceResponse[] {
    return [redactPaymentSourceForList(createPaymentSource())];
}

export function getPaymentSource(paymentSourceId: string): PaymentSourceResponse {
    return createPaymentSource(paymentSourceId);
}

export function redactPaymentSourceForList(paymentSource: PaymentSourceResponse): PaymentSourceResponse {
    return {
        ...paymentSource,
        billing_address: {
            name: paymentSource.billing_address.name,
            country: paymentSource.billing_address.country,
        },
    };
}

export function sendPaymentSourcesResponse(res: Response) {
    return res.status(200).json(listPaymentSources());
}

export function sendCreatedPaymentSourceResponse(res: Response) {
    return res.status(200).json(createPaymentSource());
}

export function sendPaymentSourceResponse(paymentSourceId: string, res: Response) {
    return res.status(200).json(getPaymentSource(paymentSourceId));
}

export function sendPaymentSourceDeletedResponse(res: Response) {
    return res.sendStatus(204);
}
