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
import { AckBulkSchema, ReadState } from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router();

router.post(
	"/",
	route({ requestBody: "AckBulkSchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as AckBulkSchema;

		// TODO: what is read_state_type ?

		await Promise.all([
			// for every new state
			...body.read_states.map(async (x) => {
				// find an existing one
				const ret =
					(await ReadState.findOne({
						where: {
							user_id: req.user_id,
							channel_id: x.channel_id,
						},
					})) ??
					// if it doesn't exist, create it (not a promise)
					ReadState.create({
						user_id: req.user_id,
						channel_id: x.channel_id,
					});

				ret.last_message_id = x.message_id;

				return ret.save();
			}),
		]);

		return res.status(204);
	},
);

export default router;
