import {
	ConnectionCallbackSchema,
	ConnectionStore,
	emitEvent,
	FieldErrors,
} from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "../../../util";

const router = Router();

router.post(
	"/",
	route({ body: "ConnectionCallbackSchema" }),
	async (req: Request, res: Response) => {
		const { connection_name } = req.params;
		const connection = ConnectionStore.connections.get(connection_name);
		if (!connection)
			throw FieldErrors({
				provider_id: {
					code: "BASE_TYPE_CHOICES",
					message: req.t("common:field.BASE_TYPE_CHOICES", {
						types: Array.from(
							ConnectionStore.connections.keys(),
						).join(", "),
					}),
				},
			});

		if (!connection.settings.enabled)
			throw FieldErrors({
				provider_id: {
					message: "This connection has been disabled server-side.",
				},
			});

		const body = req.body as ConnectionCallbackSchema;
		const userId = connection.getUserId(body.state);
		const emit = await connection.handleCallback(body);

		// whether we should emit a connections update event, only used when a connection doesnt already exist
		if (emit)
			emitEvent({
				event: "USER_CONNECTIONS_UPDATE",
				data: {},
				user_id: userId,
			});
		res.sendStatus(204);
	},
);

export default router;
