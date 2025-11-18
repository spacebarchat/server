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
import { emitEvent, Member, User, UserDeleteEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { PrivateUserProjection } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.post(
	"/",
	route({
		right: "MANAGE_USERS",
		responses: {
			204: {},
			403: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		await User.findOneOrFail({
			where: { id: req.params.user_id },
			select: [...PrivateUserProjection, "data"],
		});
		const members = await Member.find({ where: { id: req.params.user_id } });
		await Promise.all([...members.map((member) => Member.removeFromGuild(member.id, member.guild_id)), User.delete({ id: req.params.user_id })]);

		// TODO: respect intents as USER_DELETE has potential to cause privacy issues
		await emitEvent({
			event: "USER_DELETE",
			user_id: req.user_id,
			data: { user_id: req.params.user_id },
		} as UserDeleteEvent);

		res.sendStatus(204);
	},
);

export default router;
