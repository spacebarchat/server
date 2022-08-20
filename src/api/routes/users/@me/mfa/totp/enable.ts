import { route } from "@fosscord/api";
import { BackupCode, Config, generateMfaBackupCodes, generateToken, TotpEnableSchema, User } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { verifyToken } from "node-2fa";

let bcrypt: any;
try {
	bcrypt = require("bcrypt");
} catch {
	bcrypt = require("bcryptjs");
	console.log("Warning: using bcryptjs because bcrypt is not installed! Performance will be affected.");
}

const router = Router();

router.post("/", route({ body: "TotpEnableSchema" }), async (req: Request, res: Response) => {
	const body = req.body as TotpEnableSchema;

	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["data"] });

	// TODO: Are guests allowed to enable 2fa?
	if (user.data.hash) {
		if (!(await bcrypt.compare(body.password, user.data.hash))) {
			throw new HTTPError(req.t("auth:login.INVALID_PASSWORD"));
		}
	}

	if (!body.secret) throw new HTTPError(req.t("auth:login.INVALID_TOTP_SECRET"), 60005);

	if (!body.code) throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

	if (verifyToken(body.secret, body.code)?.delta != 0) throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

	let backup_codes: BackupCode[] = [];
	if (Config.get().security.twoFactor.generateBackupCodes) {
		backup_codes = generateMfaBackupCodes(req.user_id);
		await Promise.all(backup_codes.map((x) => x.save()));
	}

	await User.update({ id: req.user_id }, { mfa_enabled: true, totp_secret: body.secret });

	res.send({
		token: await generateToken(user.id),
		backup_codes: backup_codes.map((x) => ({ ...x, expired: undefined }))
	});
});

export default router;
