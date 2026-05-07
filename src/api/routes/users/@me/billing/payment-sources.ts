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
import { route, sendCreatedPaymentSourceResponse, sendPaymentSourceDeletedResponse, sendPaymentSourceResponse, sendPaymentSourcesResponse } from "@spacebar/api";

const router = Router({ mergeParams: true });

router.get("/", route({ responses: { 200: { body: "PaymentSourcesResponse" } } }), (req: Request, res: Response) => sendPaymentSourcesResponse(res));

router.post("/", route({ responses: { 200: { body: "PaymentSourceResponse" } } }), (req: Request, res: Response) => sendCreatedPaymentSourceResponse(res));

router.get("/:payment_source_id", route({ responses: { 200: { body: "PaymentSourceResponse" } } }), (req: Request, res: Response) => {
    const { payment_source_id } = req.params as { payment_source_id: string };
    return sendPaymentSourceResponse(payment_source_id, res);
});

router.patch("/:payment_source_id", route({ responses: { 200: { body: "PaymentSourceResponse" } } }), (req: Request, res: Response) => {
    const { payment_source_id } = req.params as { payment_source_id: string };
    return sendPaymentSourceResponse(payment_source_id, res);
});

router.delete("/:payment_source_id", route({ responses: { 204: {} } }), (req: Request, res: Response) => sendPaymentSourceDeletedResponse(res));

export default router;
