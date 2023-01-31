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

import { route } from "@fosscord/api";
import { Email, User } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.post(
	"/",
	route({ right: "RESEND_VERIFICATION_EMAIL" }),
	async (req: Request, res: Response) => {
		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: ["username", "email"],
		});

		if (!user.email) {
			// TODO: whats the proper error response for this?
			throw new HTTPError("User does not have an email address", 400);
		}

		await Email.sendVerificationEmail(user, user.email)
			.then((info) => {
				console.log("Message sent: %s", info.messageId);
				return res.sendStatus(204);
			})
			.catch((e) => {
				console.error(
					`Failed to send verification email to ${user.username}#${user.discriminator}: ${e}`,
				);
				throw new HTTPError("Failed to send verification email", 500);
			});
	},
);

export default router;
