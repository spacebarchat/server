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
import { Channel, DmChannelDTO, Recipient } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { DmChannelCreateSchema } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "APIDMChannelArray",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const recipients = await Recipient.find({
			where: { user_id: req.user_id, closed: false },
			relations: ["channel", "channel.recipients"],
		});
		res.json(await Promise.all(recipients.map((r) => DmChannelDTO.from(r.channel, [req.user_id]))));
	},
);

router.post(
	"/",
	route({
		requestBody: "DmChannelCreateSchema",
		responses: {
			200: {
				body: "DmChannelDTO",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as DmChannelCreateSchema;
		res.json(await Channel.createDMChannel(body.recipients, req.user_id, body.name));
	},
);

export default router;
