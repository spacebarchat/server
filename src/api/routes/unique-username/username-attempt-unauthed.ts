import { route } from "@spacebar/api";
import { Config, UniqueUsernameAttemptSchema, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.post(
	"/",
	route({
		requestBody: "UniqueUsernameAttemptSchema",
		responses: {
			200: { body: "UniqueUsernameAttemptResponse" },
			400: { body: "APIErrorResponse" },
		},
		description:
			"Checks whether a unique username is available for the user to claim.",
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

		res.json({
			taken: !(await User.isUsernameAvailable(body.username)),
		});
	},
);

export default router;
