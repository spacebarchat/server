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
import { QuestEnrollRequestSchema, QuestUserStatusSchema } from "@spacebar/schemas";
import { emitEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        description: "Accepts a quest and returns a quest user status object. Fires a Quests User Status Update Gateway event.",
        requestBody: "QuestEnrollRequestSchema",
    }),
    async (req: Request, res: Response) => {
        const { quest_id } = req.params;
        const { location } = req.body as QuestEnrollRequestSchema;

        // TODO: implement
        console.debug(`POST /quests/${quest_id}/enroll is incomplete`);

        const status: QuestUserStatusSchema = {
            claimed_at: null,
            claimed_tier: null,
            completed_at: null,
            dismissed_quest_content: 0,
            enrolled_at: new Date().toISOString(),
            last_stream_heartbeat_at: null,
            progress: {},
            quest_id,
            stream_progress_seconds: 0,
            user_id: req.user.id,
        };

        await emitEvent({
            event: "QUESTS_USER_STATUS_UPDATE",
            data: {
                user_status: status,
            },
        });

        res.json(status);
    },
);

export default router;
