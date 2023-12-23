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
import { Config, Experiments } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

router.get("/", route({}), (req: Request, res: Response) => {
	const { uniqueUsernames } = Config.get().general;

	const data: Experiments = {
		fingerprint: "fingerprint",
		assignments: [],
		guild_experiments: [],
	};
	// this enables the pomelo/unique usernames UI in the official clients
	if (uniqueUsernames) {
		// hash, revision, bucket, override, population, hash_result, as_mode
		data.assignments.push([268309827, 0, 1, -1, 7, 8062, 0, 0]);
	}
	res.send(data);
});

export default router;
