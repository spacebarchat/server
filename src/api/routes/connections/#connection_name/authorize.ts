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
import { Request, Response, Router } from "express";
import { ConnectionStore, FieldErrors } from "../../../../util";

const router = Router({ mergeParams: true });

router.get("/", route({}), async (req: Request, res: Response) => {
	const { connection_name } = req.params;
	const connection = ConnectionStore.connections.get(connection_name);
	if (!connection)
		throw FieldErrors({
			provider_id: {
				code: "BASE_TYPE_CHOICES",
				message: req.t("common:field.BASE_TYPE_CHOICES", {
					types: Array.from(ConnectionStore.connections.keys()).join(", "),
				}),
			},
		});

	if (!connection.settings.enabled)
		throw FieldErrors({
			provider_id: {
				message: "This connection has been disabled server-side.",
			},
		});

	res.json({
		url: await connection.getAuthorizationUrl(req.user_id),
	});
});

export default router;
