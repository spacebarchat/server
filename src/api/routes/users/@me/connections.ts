import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";
import { ConnectedAccount } from "../../../../util";
import { ConnectedAccountDTO } from "../../../../util/dtos/ConnectedAccountDTO";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const connections = await ConnectedAccount.find({
		where: {
			user_id: req.user_id
		},
		select: [
			"external_id",
			"type",
			"name",
			"verified",
			"visibility",
			"show_activity",
			"revoked",
			"access_token",
			"friend_sync",
			"integrations"
		]
	});

	res.json(connections.map((x) => new ConnectedAccountDTO(x, true)));
});

export default router;
