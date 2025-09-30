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
	ConnectedAccount,
	ConnectionUpdateSchema,
	DiscordApiErrors,
	emitEvent,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
const router = Router({ mergeParams: true });

// TODO: connection update schema
router.patch(
	"/",
	route({ requestBody: "ConnectionUpdateSchema" }),
	async (req: Request, res: Response) => {
		const { connection_name, connection_id } = req.params;
		const body = req.body as ConnectionUpdateSchema;

		const connection = await ConnectedAccount.findOne({
			where: {
				user_id: req.user_id,
				external_id: connection_id,
				type: connection_name,
			},
			select: [
				"external_id",
				"type",
				"name",
				"verified",
				"visibility",
				"show_activity",
				"revoked",
				"friend_sync",
				"integrations",
			],
		});

		if (!connection) return DiscordApiErrors.UNKNOWN_CONNECTION;
		// TODO: do we need to do anything if the connection is revoked?

		if (typeof body.visibility === "boolean")
			//@ts-expect-error For some reason the client sends this as a boolean, even tho docs say its a number?
			body.visibility = body.visibility ? 1 : 0;
		if (typeof body.show_activity === "boolean")
			//@ts-expect-error For some reason the client sends this as a boolean, even tho docs say its a number?
			body.show_activity = body.show_activity ? 1 : 0;
		if (typeof body.metadata_visibility === "boolean")
			//@ts-expect-error For some reason the client sends this as a boolean, even tho docs say its a number?
			body.metadata_visibility = body.metadata_visibility ? 1 : 0;

		connection.assign(req.body);

		await ConnectedAccount.update(
			{
				user_id: req.user_id,
				external_id: connection_id,
				type: connection_name,
			},
			connection,
		);
		res.json(connection.toJSON());
	},
);

router.delete("/", route({}), async (req: Request, res: Response) => {
	const { connection_name, connection_id } = req.params;

	const account = await ConnectedAccount.findOneOrFail({
		where: {
			user_id: req.user_id,
			external_id: connection_id,
			type: connection_name,
		},
	});

	await Promise.all([
		ConnectedAccount.remove(account),
		emitEvent({
			event: "USER_CONNECTIONS_UPDATE",
			data: account,
			user_id: req.user_id,
		}),
	]);

	return res.sendStatus(200);
});

export default router;
