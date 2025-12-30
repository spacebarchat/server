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

import { Request, Response, Router } from "express";
import { route } from "@spacebar/api";
import { CreateSKUSchema } from "@spacebar/schemas";
import { SKU } from "@spacebar/util";

const router: Router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        description:
            "Creates a new SKU. Returns the created SKU object on success. Requires an application with access to the store or monetization. User must be the owner of the application or member of the owning team.",
        requestBody: "CreateSKUSchema",
    }),
    async (req: Request, res: Response) => {
        const body = req.body as CreateSKUSchema;

        const sku = await SKU.createSku(body);

        res.json(sku).status(200);
    },
);

export default router;
