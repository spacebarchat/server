import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
const router = Router();

//TODO: implement audit logs
router.get("/", route({}), async (req: Request, res: Response) => {
	res.json({
		audit_log_entries: [],
		users: [],
		integrations: [],
		webhooks: [],
		guild_scheduled_events: [],
		threads: [],
		application_commands: [],
	});
});
export default router;
