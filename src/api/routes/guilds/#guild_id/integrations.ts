import { Router, Response, Request } from "express";
import { Channel, ChannelUpdateEvent, getPermission, emitEvent } from "@fosscord/util";
import { HTTPError } from "@fosscord/util";
import { route } from "@fosscord/api";
const router = Router();

//TODO: implement integrations list
router.get("/", route({}), async (req: Request, res: Response) => {
	res.json([]);
});
export default router;
