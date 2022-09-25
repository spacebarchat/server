import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { BackupCode, FieldErrors, generateMfaBackupCodes, User } from "@fosscord/util";
import bcrypt from "bcrypt";

const router = Router();

export interface MfaCodesSchema {
	password: string;
	regenerate?: boolean;
}

// TODO: This route is replaced with users/@me/mfa/codes-verification in newer clients

router.post("/", route({ body: "MfaCodesSchema" }), async (req: Request, res: Response) => {
	const { password, regenerate } = req.body as MfaCodesSchema;

	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] });

	if (!await bcrypt.compare(password, user.data.hash || "")) {
		throw FieldErrors({ password: { message: req.t("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" } });
	}

	var codes: BackupCode[];
	if (regenerate) {
		await BackupCode.update(
			{ user: { id: req.user_id } },
			{ expired: true }
		);

		codes = generateMfaBackupCodes(req.user_id);
		await Promise.all(codes.map(x => x.save()));
	}
	else {
		codes = await BackupCode.find({
			where: {
				user: {
					id: req.user_id,
				},
				expired: false,
			}
		});
	}

	return res.json({
		backup_codes: codes.map(x => ({ ...x, expired: undefined })),
	});
});

export default router;
