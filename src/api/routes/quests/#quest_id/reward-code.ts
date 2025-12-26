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
import { QuestPlatformType, QuestRewardCodeResponseSchema } from "@spacebar/schemas/quests";
import { Request, Response, Router } from "express";
const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        description: "Retrieves the reward code for the specified platform. Returns a quest reward code object on success.",
        responses: {
            200: {
                body: "QuestRewardCodeResponseSchema",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { quest_id } = req.params;

        // TODO: implement
        console.debug(`GET /quests/${quest_id}/reward-code is incomplete`);

        res.json({
            quest_id,
            claimed_at: "2025-08-01T12:00:00+00:00",
            code: "REWARD-CODE-1234",
            platform: QuestPlatformType.CROSS_PLATFORM,
            user_id: req.user.id,
        } as QuestRewardCodeResponseSchema);
    },
);

export default router;
