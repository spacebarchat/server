import { route } from "@spacebar/api";
import { Config, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

// https://discord-userdoccers.vercel.app/resources/user#get-pomelo-suggestions
router.get(
	"/",
	route({
		description:
			"Returns a suggested unique username string based on the current user's username.",
		responses: {
			400: { body: "APIErrorResponse" },
		},
	}),
	async (req: Request, res: Response) => {
		const { uniqueUsernames } = Config.get().general;
		if (!uniqueUsernames) {
			throw new HTTPError(
				"Unique Usernames feature is not enabled on this instance.",
				400,
			);
		}

		const user = await User.findOneOrFail({
			where: {
				id: req.user_id,
			},
		});

		// TODO: return a suggestion based on the users current username
		return res.json({ username: user.username.toString() });
	},
);

export default router;
