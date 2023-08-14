import { route } from "@spacebar/api";
import { Config, User } from "@spacebar/util";
import { APPerson } from "activitypub-types";
import { Request, Response, Router } from "express";

const router = Router();
export default router;

router.get("/:id", route({}), async (req: Request, res: Response) => {
	const id = req.params.name;

	const user = await User.findOneOrFail({ where: { id } });

	const { webDomain } = Config.get().federation;

	const ret: APPerson = {
		"@context": "https://www.w3.org/ns/activitystreams",
		type: "Person",
		id: `https://${webDomain}/fed/user/${user.id}`,
		name: user.username,
		preferredUsername: user.username,
		summary: user.bio,
		icon: user.avatar
			? [
					`${Config.get().cdn.endpointPublic}/avatars/${user.id}/${
						user.avatar
					}`,
			  ]
			: undefined,

		inbox: `https://${webDomain}/fed/user/${user.id}/inbox`,
		outbox: `https://${webDomain}/fed/user/${user.id}/outbox`,
		followers: `https://${webDomain}/fed/user/${user.id}/followers`,
		following: `https://${webDomain}/fed/user/${user.id}/following`,
		liked: `https://${webDomain}/fed/user/${user.id}/likeds`,
	};

	return res.json(ret);
});
