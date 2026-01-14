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

const router = Router({ mergeParams: true });

for (const type of [
    "guild",
    "guild_discovery",
    "guild_directory_entry",
    "guild_scheduled_event",
    "message",
    "stage_channel",
    "first_dm",
    "user",
    "application",
    "widget",
] as const) {
    router.get(
        `/${type}`,
        route({
            description: `Get reporting menu options for ${type} reports.`,
            responses: {
                200: {
                    body: "ReportingMenuResponse",
                },
                204: {},
            },
        }),
        (req: Request, res: Response) => {
            // TODO: implement
            //res.send([] as ReportingMenuResponseSchema);
        },
    );
}
export default router;
