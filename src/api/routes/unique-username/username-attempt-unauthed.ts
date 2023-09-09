import { route } from "@spacebar/api";
import { Config, User, UsernameAttemptUnauthedSchema } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.post(
	"/",
	route({
		requestBody: "UsernameAttemptUnauthedSchema",
		responses: {
			200: { body: "UsernameAttemptResponse" },
			400: { body: "APIErrorResponse" },
		},
		description: "Check if a username is available",
	}),
	async (req: Request, res: Response) => {
		const body = req.body as UsernameAttemptUnauthedSchema;
		const { uniqueUsernames } = Config.get().general;
		if (!uniqueUsernames) {
			throw new HTTPError(
				"Unique Usernames feature is not enabled on this instance.",
				400,
			);
		}

		res.json({
			taken: !User.isUsernameAvailable(body.username),
		});
	},
);

export default router;
