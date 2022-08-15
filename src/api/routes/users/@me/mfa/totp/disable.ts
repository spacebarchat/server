import { BackupCode, generateToken, TotpDisableSchema, User } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { verifyToken } from "node-2fa";
import { route } from "../../../../..";

const router = Router();

router.post("/", route({ body: "TotpDisableSchema" }), async (req: Request, res: Response) => {
	const body = req.body as TotpDisableSchema;

	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["totp_secret"] });

	const backup = await BackupCode.findOne({ where: { code: body.code } });
	if (!backup) {
		const ret = verifyToken(user.totp_secret!, body.code);
		if (!ret || ret.delta != 0) throw new HTTPError(req.t("auth:login.INVALID_TOTP_CODE"), 60008);
	}

	await User.update(
		{ id: req.user_id },
		{
			mfa_enabled: false,
			totp_secret: ""
		}
	);

	await BackupCode.update(
		{ user: { id: req.user_id } },
		{
			expired: true
		}
	);

	return res.json({
		token: await generateToken(user.id)
	});
});

export default router;
