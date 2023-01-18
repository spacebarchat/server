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

import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { Config } from "@fosscord/util";
import { config } from "dotenv";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { cdn, gateway } = Config.get();

	const IdentityForm = {
		cdn: cdn.endpointPublic || process.env.CDN || "http://localhost:3001",
		gateway:
			gateway.endpointPublic ||
			process.env.GATEWAY ||
			"ws://localhost:3002",
	};

	res.json(IdentityForm);
});

export default router;
