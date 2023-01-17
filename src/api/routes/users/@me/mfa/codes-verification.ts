import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import {
	BackupCode,
	generateMfaBackupCodes,
	User,
	CodesVerificationSchema,
	DiscordApiErrors,
} from "@fosscord/util";

const router = Router();

router.post(
	"/",
	route({ body: "CodesVerificationSchema" }),
	async (req: Request, res: Response) => {
		// const { key, nonce, regenerate } = req.body as CodesVerificationSchema;
		const { regenerate } = req.body as CodesVerificationSchema;

		// TODO: We don't have email/etc etc, so can't send a verification code.
		// Once that's done, this route can verify `key`

		// const user = await User.findOneOrFail({ where: { id: req.user_id } });
		if ((await User.count({ where: { id: req.user_id } })) === 0)
			throw DiscordApiErrors.UNKNOWN_USER;

		let codes: BackupCode[];
		if (regenerate) {
			await BackupCode.update(
				{ user: { id: req.user_id } },
				{ expired: true },
			);

			codes = generateMfaBackupCodes(req.user_id);
			await Promise.all(codes.map((x) => x.save()));
		} else {
			codes = await BackupCode.find({
				where: {
					user: {
						id: req.user_id,
					},
					expired: false,
				},
			});
		}

		return res.json({
			backup_codes: codes.map((x) => ({ ...x, expired: undefined })),
		});
	},
);

export default router;
