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

import { route } from "@spacebar/api/util/handlers/route";
import { Request, Response, Router } from "express";
import { GifMediaTypes } from "@spacebar/schemas";
import { GifProviderManager } from "@spacebar/integrations/gifs";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        query: {
            media_format: {
                type: "string",
                description: "Media format",
                values: Object.keys(GifMediaTypes).filter((key) => isNaN(Number(key))),
            },
            locale: {
                type: "string",
                description: "Locale",
            },
            limit: {
                type: "number",
                description: "Maximum number of GIFs to return",
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
        const provider = GifProviderManager.getProvider((req.query.provider as string) ?? "klipy");
        const results = await provider.getTrendingGifs(req.query as typeof provider.getTrendingGifs.arguments);
        res.json(results).status(200);
    },
);

export default router;
