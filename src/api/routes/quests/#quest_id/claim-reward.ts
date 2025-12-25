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
import { EntitlementSpecialSourceType, EntitlementType, QuestClaimRewardRequestSchema, QuestClaimRewardResponseSchema } from "@spacebar/schemas/quests";
import { emitEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        description:
            "Claims the quest's rewards, setting the completed_at and claimed_at fields of the quest user status to the current timestamp. Fires a Quests User Status Update Gateway event.",
        requestBody: "QuestClaimRewardRequestSchema",
        responses: {
            200: {
                body: "QuestClaimRewardResponseSchema",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { quest_id } = req.params;
        const { location, platform } = req.body as QuestClaimRewardRequestSchema;

        // TODO: implement
        console.debug(`POST /quests/${quest_id}/claim-reward is incomplete`);

        await emitEvent({
            event: "QUESTS_USER_STATUS_UPDATE",
            data: {
                user_status: {
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
                },
            },
        });

        res.json({
            claimed_at: new Date().toISOString(),
            entitlement_expiration_metadata: {},
            entitlements: [
                {
                    id: "1453600390154162249",
                    sku_id: "1287881739531976815",
                    application_id: "1287870191526613112",
                    user_id: req.user.id,
                    deleted: false,
                    starts_at: null,
                    ends_at: null,
                    type: EntitlementType.QUEST_REWARD,
                    tenant_metadata: {},
                    source_type: EntitlementSpecialSourceType.QUEST_REWARD,
                    gift_code_flags: 0, // PAYMENT_SOURCE_REQUIRED, todo: make a bitfield enum
                    promotion_id: null,
                },
            ],
            errors: [],
        } as QuestClaimRewardResponseSchema);
    },
);

export default router;
