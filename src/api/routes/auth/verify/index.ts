import { route, verifyCaptcha } from "@fosscord/api";
import { Config, FieldErrors, verifyToken } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.post(
	"/",
	route({ body: "VerifyEmailSchema" }),
	async (req: Request, res: Response) => {
		const { captcha_key, token } = req.body;

		if (captcha_key) {
			const { sitekey, service } = Config.get().security.captcha;
			const verify = await verifyCaptcha(captcha_key);
			if (!verify.success) {
				return res.status(400).json({
					captcha_key: verify["error-codes"],
					captcha_sitekey: sitekey,
					captcha_service: service,
				});
			}
		}

		try {
			const { jwtSecret } = Config.get().security;

			const { decoded, user } = await verifyToken(token, jwtSecret);
			// toksn should last for 24 hours from the time they were issued
			if (decoded.exp < Date.now() / 1000) {
				throw FieldErrors({
					token: {
						code: "TOKEN_INVALID",
						message: "Invalid token", // TODO: add translation
					},
				});
			}
			user.verified = true;
		} catch (error: any) {
			throw new HTTPError(error?.toString(), 400);
		}
	},
);

export default router;
