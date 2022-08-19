import { Router, Request, Response } from "express";
import { FieldErrors } from "@fosscord/util";
import { Connections } from "../../../../util/util/Connections";
import { route } from "../../../util";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { connection_id } = req.params;
	const connection = Connections.connections[connection_id];
	if (!connection)
		throw FieldErrors({
			provider_id: {
				code: "BASE_TYPE_CHOICES",
				message: req.t("common:field.BASE_TYPE_CHOICES", {
					types: Object.keys(Connections.connections).join(", ")
				})
			}
		});
	if (!connection.enabled)
		throw FieldErrors({
			provider_id: {
				message: "This connection has been disabled server-side."
			}
		});

	res.json({
		url: await connection.makeAuthorizeUrl(req.user_id)
	});
});

export default router;
