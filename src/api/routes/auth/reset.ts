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
import { HTTPError } from "lambert-server";

const router = Router();

router.post(
	"/",
	route({ body: "PasswordResetSchema" }),
	async (req: Request, res: Response) => {
		const { password, token } = req.body as PasswordResetSchema;

		try {
			const { jwtSecret } = Config.get().security;
			const { user } = await checkToken(token, jwtSecret, true);

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
		} catch (e) {
			if ((e as Error).toString() === "Invalid Token")
				throw FieldErrors({
					password: {
						message: req.t("auth:password_reset.INVALID_TOKEN"),
						code: "INVALID_TOKEN",
					},
				});

			throw new HTTPError((e as Error).toString(), 400);
		}
	},
);

export default router;
