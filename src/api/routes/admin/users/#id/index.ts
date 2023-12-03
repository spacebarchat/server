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
	AdminUserModifySchema,
	AdminUserProjection,
	FieldErrors,
	User,
	UserUpdateEvent,
	emitEvent,
	handleFile,
} from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
const router = Router();

router.get(
	"/",
	route({
		description: "Get a user",
		right: "ADMIN_READ_USERS",
		responses: {
			200: {
				body: "AdminUserResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const user = await User.findOneOrFail({
			where: { id },
			select: AdminUserProjection,
		});
		res.send(user);
	},
);

router.patch(
	"/",
	route({
		description: "Update a user",
		right: "ADMIN_UPDATE_USERS",
		requestBody: "AdminUserModifySchema",
		responses: {
			200: {
				body: "AdminUserResponse",
			},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as AdminUserModifySchema;

		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: [...AdminUserProjection, "data"],
		});

		if (body.avatar)
			body.avatar = await handleFile(
				`/avatars/${req.user_id}`,
				body.avatar as string,
			);
		if (body.banner)
			body.banner = await handleFile(
				`/banners/${req.user_id}`,
				body.banner as string,
			);

		if (body.password) {
			user.data.hash = await bcrypt.hash(body.password, 12);
			user.data.valid_tokens_since = new Date();
		}

		if (body.username) {
			const check_username = body?.username?.replace(/\s/g, "");
			if (!check_username) {
				throw FieldErrors({
					username: {
						code: "BASE_TYPE_REQUIRED",
						message: req.t("common:field.BASE_TYPE_REQUIRED"),
					},
				});
			}
		}

		user.assign(body);
		user.validate();
		await user.save();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		delete user.data;

		// TODO: send update member list event in gateway
		await emitEvent({
			event: "USER_UPDATE",
			user_id: req.user_id,
			data: user,
		} as UserUpdateEvent);

		res.json({
			...user,
		});
	},
);

router.delete(
	"/",
	route({
		description: "Delete a user",
		right: "ADMIN_DELETE_USERS",
		responses: {
			200: {},
			400: {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { id } = req.params;
		const user = await User.findOneOrFail({
			where: { id },
			select: AdminUserProjection,
		});
		await user.remove();
		res.sendStatus(200);
	},
);

export default router;
