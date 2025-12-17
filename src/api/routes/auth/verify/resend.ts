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
import { Email, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router({ mergeParams: true });

router.post(
	"/",
	route({
		right: "RESEND_VERIFICATION_EMAIL",
		responses: {
			204: {},
			400: {
				body: "APIErrorResponse",
			},
			500: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: ["username", "email", "verified"],
		});

		if (!user.email) {
			// TODO: whats the proper error response for this?
			throw new HTTPError("User does not have an email address", 400);
		}

		if (user.verified) {
			throw new HTTPError("Email is already verified", 400);
		}

		await Email.sendVerifyEmail(user, user.email)
			.then(() => {
				return res.sendStatus(204);
			})
			.catch((e) => {
				console.error(`Failed to send verification email to ${user.username}#${user.discriminator}: ${e}`);
				throw new HTTPError("Failed to send verification email", 500);
			});
	},
);

export default router;
