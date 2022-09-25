import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { FieldErrors, User } from "@fosscord/util";
import bcrypt from "bcrypt";
const router = Router();

export interface BackupCodesChallengeSchema {
	password: string;
}

router.post("/", route({ body: "BackupCodesChallengeSchema" }), async (req: Request, res: Response) => {
	const { password } = req.body as BackupCodesChallengeSchema;

	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] });

	if (!await bcrypt.compare(password, user.data.hash || "")) {
		throw FieldErrors({ password: { message: req.t("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" } });
	}

	return res.json({
		nonce: "NoncePlaceholder",
		regenerate_nonce: "RegenNoncePlaceholder",
	});
});

export default router;
