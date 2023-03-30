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
import { Member, PublicMemberProjection } from "@fosscord/util";
import { route } from "@fosscord/api";
import { MoreThan } from "typeorm";
import { HTTPError } from "lambert-server";

const router = Router();

// TODO: send over websocket
// TODO: check for GUILD_MEMBERS intent

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const limit = Number(req.query.limit) || 1;
	if (limit > 1000 || limit < 1)
		throw new HTTPError("Limit must be between 1 and 1000");
	const after = `${req.query.after}`;
	const query = after ? { id: MoreThan(after) } : {};

	await Member.IsInGuildOrFail(req.user_id, guild_id);

	const members = await Member.find({
		where: { guild_id, ...query },
		select: PublicMemberProjection,
		take: limit,
		order: { id: "ASC" },
	});

	return res.json(members);
});

export default router;
