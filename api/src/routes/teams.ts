import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { Team, TeamMember } from "@fosscord/util";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const members = await TeamMember.find({ where: { user_id: req.user_id }, relations: ["team"] });

	res.json(members.map((x) => x.team));
});

export default router;
