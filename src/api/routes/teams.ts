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
import { Team, TeamMember, User } from "@spacebar/util";
import { HTTPError } from "lambert-server";
import { TeamCreateSchema, TeamMemberRole, TeamMemberState } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        query: {
            include_payout_account_status: {
                type: "boolean",
                description: "Whether to include team payout account status in the response (default false)",
            },
        },
        responses: {
            200: {
                body: "TeamListResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const teams = await Team.find({
            where: {
                owner_user_id: req.user_id,
            },
            relations: { members: true },
        });

        res.send(teams);
    },
);

router.post(
    "/",
    route({
        requestBody: "TeamCreateSchema",
        responses: {
            200: {
                body: "Team",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const user = await User.findOneOrFail({
            where: { id: req.user_id },
            select: { mfa_enabled: true },
        });
        if (!user.mfa_enabled) throw new HTTPError("You must enable MFA to create a team");

        const body = req.body as TeamCreateSchema;

        const team = Team.create({
            name: body.name,
            owner_user_id: req.user_id,
        });
        await team.save();

        await TeamMember.create({
            user_id: req.user_id,
            team_id: team.id,
            membership_state: TeamMemberState.ACCEPTED,
            permissions: ["*"],
            role: TeamMemberRole.ADMIN,
        }).save();

        res.json(team);
    },
);

export default router;
