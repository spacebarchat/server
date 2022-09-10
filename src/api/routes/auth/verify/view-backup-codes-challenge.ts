import { route } from "@fosscord/api";
import { BackupCodesChallengeSchema, FieldErrors, User } from "@fosscord/util";
import { Request, Response, Router } from "express";

let bcrypt: any;
try {
	bcrypt = require("bcrypt");
} catch {
	bcrypt = require("bcryptjs");
	console.log("Warning: using bcryptjs because bcrypt is not installed! Performance will be affected.");
}

const router = Router();

router.post("/", route({ body: "BackupCodesChallengeSchema" }), async (req: Request, res: Response) => {
	const { password } = req.body as BackupCodesChallengeSchema;

	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] });

	if (!(await bcrypt.compare(password, user.data.hash || ""))) {
		throw FieldErrors({ password: { message: req.t("auth:login.INVALID_PASSWORD"), code: "INVALID_PASSWORD" } });
	}

	return res.json({
		nonce: "NoncePlaceholder",
		regenerate_nonce: "RegenNoncePlaceholder"
	});
});

export default router;
