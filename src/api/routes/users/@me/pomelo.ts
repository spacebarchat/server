import { route } from "@spacebar/api";
import {
	Config,
	FieldErrors,
	UniqueUsernameAttemptSchema,
	User,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

// https://discord-userdoccers.vercel.app/resources/user#create-pomelo-migration
router.post(
	"/",
	route({
		description:
			"Claims a unique username for the user. Returns the updated user object on success. Fires a User Update Gateway event.",
		requestBody: "UniqueUsernameAttemptSchema",
		responses: {
			200: { body: "PrivateUserResponse" },
			400: { body: "APIErrorResponse" },
		},
	}),
	async (req: Request, res: Response) => {
		const body = req.body as UniqueUsernameAttemptSchema;
		const { uniqueUsernames } = Config.get().general;
		if (!uniqueUsernames) {
			throw new HTTPError(
				"Unique Usernames feature is not enabled on this instance.",
				400,
			);
		}

		const isAvailable = await User.isUsernameAvailable(body.username);

		if (!isAvailable) {
			throw FieldErrors({
				username: {
					code: "USERNAME_TOO_MANY_USERS",
					message:
						req?.t("auth:register.USERNAME_TOO_MANY_USERS") || "",
				},
			});
		}

		const user = await User.findOneOrFail({
			where: {
				id: req.user_id,
			},
		});

		user.legacy_username = user.username;
		user.username = body.username;
		user.discriminator = "0";
		const newUser = await user.save();

		res.json(newUser.toPrivateUser());
	},
);

export default router;
