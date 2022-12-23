import { ConnectionStore, FieldErrors } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { connection_name } = req.params;
	const connection = ConnectionStore.connections.get(connection_name);
	if (!connection)
		throw FieldErrors({
			provider_id: {
				code: "BASE_TYPE_CHOICES",
				message: req.t("common:field.BASE_TYPE_CHOICES", {
					types: Array.from(ConnectionStore.connections.keys()).join(
						", ",
					),
				}),
			},
		});

	if (!connection.settings.enabled)
		throw FieldErrors({
			provider_id: {
				message: "This connection has been disabled server-side.",
			},
		});

	res.json({
		url: await connection.getAuthorizationUrl(req.user_id),
	});
});

export default router;
