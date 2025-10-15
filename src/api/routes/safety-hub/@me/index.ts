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
import { User } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { AccountStandingResponse, AccountStandingState, AppealEligibility } from "@spacebar/schemas"

const router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "AccountStandingResponse",
			},
			401: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: ["data"],
		});

		res.send({
			classifications: [],
			guild_classifications: [],
			account_standing: {
				state: AccountStandingState.ALL_GOOD,
			},
			is_dsa_eligible: true,
			username: user.username,
			discriminator: user.discriminator,
			is_appeal_eligible: true,
			appeal_eligibility: [AppealEligibility.DSA_ELIGIBLE, AppealEligibility.IN_APP_ELIGIBLE, AppealEligibility.AGE_VERIFY_ELIGIBLE],
		} as AccountStandingResponse);
	},
);

export default router;
