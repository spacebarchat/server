import { route } from "@spacebar/api";
import { Config } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
const router = Router();

router.get(
	"/",
	route({
		description:
			"Returns a suggested unique username string based on the current user's username.",
		query: {
			global_name: {
				type: "string",
				required: false,
			},
		},
		responses: {
			400: { body: "APIErrorResponse" },
		},
	}),
	async (req: Request, res: Response) => {
		const globalName = req.query.globalName as string | undefined;
		const { uniqueUsernames } = Config.get().general;
		if (!uniqueUsernames) {
			throw new HTTPError(
				"Unique Usernames feature is not enabled on this instance.",
				400,
			);
		}

		// return a random suggestion
		if (!globalName) return res.json({ username: "" });
		// return a suggestion based on the globalName
		return res.json({ username: globalName });
	},
);

export default router;
