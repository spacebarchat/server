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
import { BackupCode, generateToken, User, TotpSchema } from "@fosscord/util";
import { verifyToken } from "node-2fa";
import { HTTPError } from "lambert-server";
const router = Router();

router.post(
	"/",
	route({ body: "TotpSchema" }),
	async (req: Request, res: Response) => {
		// const { code, ticket, gift_code_sku_id, login_source } =
		const { code, ticket } = req.body as TotpSchema;

		const user = await User.findOneOrFail({
			where: {
				totp_last_ticket: ticket,
			},
			select: ["id", "totp_secret", "settings"],
		});

		const backup = await BackupCode.findOne({
			where: {
				code: code,
				expired: false,
				consumed: false,
				user: { id: user.id },
			},
		});

		if (!backup) {
			const ret = verifyToken(user.totp_secret || "", code);
			if (!ret || ret.delta != 0)
				throw new HTTPError(
					req.t("auth:login.INVALID_TOTP_CODE"),
					60008,
				);
		} else {
			backup.consumed = true;
			await backup.save();
		}

		await User.update({ id: user.id }, { totp_last_ticket: "" });

		return res.json({
			token: await generateToken(user.id),
			user_settings: user.settings,
		});
	},
);

export default router;
