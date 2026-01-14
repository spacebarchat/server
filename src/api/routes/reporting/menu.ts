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

import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { ReportMenuTypeNames } from "../../../schemas/api/reports/ReportMenu";

const router = Router({ mergeParams: true });

console.log("[Server] Registering reporting menu routes...");
router.get(
    "/",
    route({
        description: "[EXT] Get available reporting menu types.",
        responses: {
            200: {
                body: "Array<ReportMenuTypeNames>",
            },
        },
    }),
    (req: Request, res: Response) => {
        res.json(Object.values(ReportMenuTypeNames));
    },
);

for (const type of Object.values(ReportMenuTypeNames)) {
    console.log(`[Server] Route /reporting/menu/${type} registered (reports).`);
    router.get(
        `/${type}`,
        route({
            description: `Get reporting menu options for ${type} reports.`,
            query: {
                variant: { type: "string", required: false, description: "Version variant of the menu to retrieve (max 256 characters, default active)" },
            },
            responses: {
                200: {
                    body: "ReportingMenuResponse",
                },
                204: {},
            },
        }),
        (req: Request, res: Response) => {
            // TODO: implement
            // res.send([] as ReportingMenuResponseSchema);
        },
    );
}
export default router;
