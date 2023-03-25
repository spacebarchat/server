import { route } from "@fosscord/api";
import {
	checkToken,
	Config,
	Email,
	FieldErrors,
	generateToken,
	PasswordResetSchema,
	User,
} from "@fosscord/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";

const router = Router();

// TODO: the response interface also returns settings, but this route doesn't actually return that.
router.post(
	"/",
	route({
		requestBody: "PasswordResetSchema",
		responses: {
			200: {
				body: "TokenOnlyResponse",
			},
			400: {
				body: "APIErrorOrCaptchaResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { password, token } = req.body as PasswordResetSchema;

		const { jwtSecret } = Config.get().security;

		let user;
		try {
			const userTokenData = await checkToken(token, jwtSecret, true);
			user = userTokenData.user;
		} catch {
			throw FieldErrors({
				password: {
					message: req.t("auth:password_reset.INVALID_TOKEN"),
					code: "INVALID_TOKEN",
				},
			});
		}

		// the salt is saved in the password refer to bcrypt docs
		const hash = await bcrypt.hash(password, 12);

		const data = {
			data: {
				hash,
				valid_tokens_since: new Date(),
			},
		};
		await User.update({ id: user.id }, data);

		// come on, the user has to have an email to reset their password in the first place
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		await Email.sendPasswordChanged(user, user.email!);

		res.json({ token: await generateToken(user.id) });
	},
);

export default router;
