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

import { Request, Response, Router } from "express";
import { route } from "@spacebar/api/util/handlers/route";
import { GifMediaTypes } from "@spacebar/schemas";
import { GifProviderManager } from "@spacebar/util/util/integrations/gifProviders/GifProviderManager";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        query: {
            q: {
                type: "string",
                required: true,
                description: "Search query",
            },
            media_format: {
                type: "string",
                description: "Media format",
                values: Object.keys(GifMediaTypes).filter((key) => isNaN(Number(key))),
            },
            locale: {
                type: "string",
                description: "Locale",
            },
            provider: {
                type: "string",
                description: "Provider to use",
            },
        },
        responses: {
            200: {
                body: "GifsResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { provider } = req.query;

        const impl = GifProviderManager.getProvider((provider as string) ?? "tenor");
        const result = await impl.search(req.query as typeof impl.search.arguments);

        res.json(result).status(200);
    },
);

export default router;
