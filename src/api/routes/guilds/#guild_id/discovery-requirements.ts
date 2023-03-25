/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { route } from "@fosscord/api";
import { Request, Response, Router } from "express";

const router = Router();

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "GuildDiscoveryRequirements",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		// TODO:
		// Load from database
		// Admin control, but for now it allows anyone to be discoverable

		res.send({
			guild_id: guild_id,
			safe_environment: true,
			healthy: true,
			health_score_pending: false,
			size: true,
			nsfw_properties: {},
			protected: true,
			sufficient: true,
			sufficient_without_grace_period: true,
			valid_rules_channel: true,
			retention_healthy: true,
			engagement_healthy: true,
			age: true,
			minimum_age: 0,
			health_score: {
				avg_nonnew_participators: 0,
				avg_nonnew_communicators: 0,
				num_intentful_joiners: 0,
				perc_ret_w1_intentful: 0,
			},
			minimum_size: 0,
		});
	},
);

export default router;
