/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

import { Router, Response, Request } from "express";
import { route } from "@spacebar/api";

const router = Router({ mergeParams: true });

// https://docs.discord.food/resources/billing#example-payment-source
const example = {
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

router.get("/", route({}), (req: Request, res: Response) => {
    // TODO: schema
    res.json([example]).status(200);
});

router.post("/", route({}), (req: Request, res: Response) => {
    // TODO: schema
    res.json([example]).status(200);
});

router.get("/:payment_source_id", route({}), (req: Request, res: Response) => {
    // TODO: schema
    res.json({
        ...example,
        id: req.route.payment_source_id,
    }).status(200);
});

router.patch("/:payment_source_id", route({}), (req: Request, res: Response) => {
    // TODO: schema
    res.json({
        ...example,
        id: req.route.payment_source_id,
    }).status(200);
});

router.delete("/:payment_source_id", route({}), (req: Request, res: Response) => {
    // TODO: schema
    res.status(204);
});

export default router;
