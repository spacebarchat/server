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

import { Router, Response, Request } from "express";
import { route } from "@spacebar/api";
import { FieldErrors, Release } from "@spacebar/util";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { platform } = req.query;

	if (!platform)
		throw FieldErrors({
			platform: {
				code: "BASE_TYPE_REQUIRED",
				message: req.t("common:field.BASE_TYPE_REQUIRED"),
			},
		});

	const release = await Release.findOneOrFail({
		where: {
			enabled: true,
			platform: platform as string,
		},
		order: { pub_date: "DESC" },
	});

	res.redirect(release.url);
});

export default router;
