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
import {
	ConnectionCallbackSchema,
	ConnectionStore,
	emitEvent,
	FieldErrors,
} from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router();

router.post(
	"/",
	route({ requestBody: "ConnectionCallbackSchema" }),
	async (req: Request, res: Response) => {
		const { connection_name } = req.params;
		const connection = ConnectionStore.connections.get(connection_name);
		if (!connection)
			throw FieldErrors({
				provider_id: {
					code: "BASE_TYPE_CHOICES",
					message: req.t("common:field.BASE_TYPE_CHOICES", {
						types: Array.from(
							ConnectionStore.connections.keys(),
						).join(", "),
					}),
				},
			});

		if (!connection.settings.enabled)
			throw FieldErrors({
				provider_id: {
					message: "This connection has been disabled server-side.",
				},
			});

		const body = req.body as ConnectionCallbackSchema;
		const userId = connection.getUserId(body.state);
		const connectedAccnt = await connection.handleCallback(body);

		// whether we should emit a connections update event, only used when a connection doesnt already exist
		if (connectedAccnt)
			emitEvent({
				event: "USER_CONNECTIONS_UPDATE",
				data: { ...connectedAccnt, token_data: undefined },
				user_id: userId,
			});

		res.sendStatus(204);
	},
);

export default router;
