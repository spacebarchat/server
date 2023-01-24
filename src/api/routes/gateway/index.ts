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

export interface GatewayResponse {
	url: string;
}

const options: RouteOptions = {
	test: {
		response: {
			body: "GatewayResponse",
		},
	},
};

router.get("/", route(options), (req: Request, res: Response) => {
	const { endpointPublic } = Config.get().gateway;
	res.json({
		url: endpointPublic || process.env.GATEWAY || "ws://localhost:3002",
	});
});

export default router;
