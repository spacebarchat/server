import { Router, Response, Request } from "express";
import { Channel, ChannelUpdateEvent, getPermission, emitEvent } from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { route } from "@fosscord/api";
import { ChannelModifySchema } from "../../channels/#channel_id";
const router = Router();

//TODO: implement integrations list
router.get("/", route({}), async (req: Request, res: Response) => {
	res.json([]);
});
export default router;
