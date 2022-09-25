import { Router, Request, Response } from "express";
import { User, generateToken, BackupCode, generateMfaBackupCodes } from "@fosscord/util";
import { route } from "@fosscord/api";
import bcrypt from "bcrypt";
import { HTTPError } from "lambert-server";
import { verifyToken } from 'node-2fa';
import crypto from "crypto";

const router = Router();

export interface TotpEnableSchema {
	password: string;
	code?: string;
	secret?: string;
}

router.post("/", route({ body: "TotpEnableSchema" }), async (req: Request, res: Response) => {
	const body = req.body as TotpEnableSchema;

	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["data", "email"] });

	if (user.email == "demo@maddy.k.vu") throw new HTTPError("Demo user, sorry", 400);

	// TODO: Are guests allowed to enable 2fa?
	if (user.data.hash) {
		if (!await bcrypt.compare(body.password, user.data.hash)) {
			throw new HTTPError(req.t("auth:login.INVALID_PASSWORD"));
		}
	}

	if (!body.secret)
		throw new HTTPError(req.t("auth:login.INVALID_TOTP_SECRET"), 60005);

	if (!body.code)
		throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

	if (verifyToken(body.secret, body.code)?.delta != 0)
		throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);

	let backup_codes = generateMfaBackupCodes(req.user_id);
	await Promise.all(backup_codes.map(x => x.save()));
	await User.update(
		{ id: req.user_id },
		{ mfa_enabled: true, totp_secret: body.secret }
	);

	res.send({
		token: await generateToken(user.id),
		backup_codes: backup_codes.map(x => ({ ...x, expired: undefined })),
	});
});

export default router;