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

import { Config } from "@fosscord/util";
import { Router, Response, Request } from "express";
import { route, RouteOptions } from "@fosscord/api";

const router = Router();

export interface GatewayBotResponse {
	url: string;
	shards: number;
	session_start_limit: {
		total: number;
		remaining: number;
		reset_after: number;
		max_concurrency: number;
	};
}

const options: RouteOptions = {
	test: {
		response: {
			body: "GatewayBotResponse",
		},
	},
};

router.get("/", route(options), (req: Request, res: Response) => {
	const { endpointPublic } = Config.get().gateway;
	res.json({
		url:
			process.env.WS_PROTOCOL +
				"://" +
				process.env.HOSTNAME +
				":" +
				process.env.PORT || "ws://0.0.0.0:3001",
		shards: 1,
		session_start_limit: {
			total: 1000,
			remaining: 999,
			reset_after: 14400000,
			max_concurrency: 1,
		},
	});
});

export default router;
