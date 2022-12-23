import { route } from "@fosscord/api";
import { ConnectedAccount, ConnectedAccountDTO } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const connections = await ConnectedAccount.find({
		where: {
			user_id: req.user_id,
		},
		select: [
			"external_id",
			"type",
			"name",
			"verified",
			"visibility",
			"show_activity",
			"revoked",
			"token_data",
			"friend_sync",
			"integrations",
		],
	});

	res.json(connections.map((x) => new ConnectedAccountDTO(x, true)));
});

export default router;
