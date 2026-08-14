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

import { Router, Response, Request } from "express";
import { route } from "@spacebar/api/middlewares";
import { Config } from "@spacebar/util";
import { SpacebarWellKnownClientResponse } from "@spacebar/schemas/api/spacebar/WellKnown";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        spacebarOnly: true,
        authentication: "never",
        responses: {
            200: {
                body: "SpacebarWellKnownClientResponse",
            },
        },
    }),
    (req: Request, res: Response) => {
        res.json({
            api: {
                baseUrl: Config.get().api.endpointPublic!.split("/api/")[0],
                apiVersions: {
                    default: Config.get().api.defaultVersion,
                    active: Config.get().api.activeVersions,
                },
            },
            cdn: {
                baseUrl: Config.get().cdn.endpointPublic!,
            },
            gateway: {
                baseUrl: Config.get().gateway.endpointPublic!,
                encoding: ["etf", "json"],
                compression: ["zstd-stream", "zlib-stream", null],
            },
            admin:
                Config.get().admin.endpointPublic === null
                    ? undefined
                    : {
                          baseUrl: Config.get().admin.endpointPublic!,
                      },
        } satisfies SpacebarWellKnownClientResponse);
    },
);

export default router;
