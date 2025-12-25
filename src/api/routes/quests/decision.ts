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

import { route } from "@spacebar/api";
import { QuestPlacementArea, QuestPlacementResponseSchema } from "@spacebar/schemas";
import { FieldErrors } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        description: "Returns the sponsored quest that should be shown to the user in a specific placement.",
        query: {
            placement: {
                type: "number",
                description: "The quest placement area to get the quest for",
            },
            client_heartbeat_session_id: {
                type: "string",
                description: "A client-generated UUID representing the current persisted analytics heartbeat",
            },
        },
        responses: {
            200: {
                body: "QuestPlacementResponseSchema",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { placement, client_heartbeat_session_id } = req.query;
        // check if placement is a valid QuestPlacementArea
        if (!Object.values(QuestPlacementArea).includes(placement as unknown as number)) {
            throw FieldErrors({
                placement: {
                    code: "ENUM_TYPE_COERCE",
                    message: req.t("common:field.ENUM_TYPE_COERCE", {
                        value: placement,
                    }),
                },
            });
        }

        res.json({} as QuestPlacementResponseSchema);
    },
);

export default router;
