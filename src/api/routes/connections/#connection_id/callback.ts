import { Request, Response, Router } from "express";
import { DiscordApiErrors, emitEvent, FieldErrors, UserConnectionsUpdateEvent } from "../../../../util";
import { ConnectionAuthCallbackSchema } from "../../../../util/schemas/ConnectionAuthCallbackSchema";
import { Connections } from "../../../../util/util/Connections";
import { route } from "../../../util";

const router = Router();

router.post("/", route({ body: "ConnectionAuthCallbackSchema" }), async (req: Request, res: Response) => {
	const body = req.body as ConnectionAuthCallbackSchema;

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

	if (!body.openid_params) {
		if (body.code && !body.state) {
			throw FieldErrors({
				state: {
					code: "BASE_TYPE_REQUIRED",
					message: req.t("common:field.BASE_TYPE_REQUIRED")
				}
			});
		}

		if (body.state && !body.code) {
			throw FieldErrors({
				state: {
					code: "BASE_TYPE_REQUIRED",
					message: req.t("common:field.BASE_TYPE_REQUIRED")
				}
			});
		}
	}

	if (!body.code && !body.state && !body.openid_params) {
		throw FieldErrors({
			openid_params: {
				code: "BASE_TYPE_REQUIRED",
				message: req.t("common:field.BASE_TYPE_REQUIRED")
			}
		});
	}

	const user_id = connection.getUserIdFromState(body.state!);
	if (!user_id) throw DiscordApiErrors.INVALID_OAUTH_STATE;

	// for OID, this just returns the user's external id
	const token = await connection.exchangeCode(body);
	const userInfo = await connection.getUser(token);

	// check if the user has already linked this external account
	const exists = await connection.hasConnection(user_id, userInfo);

	if (!exists) {
		const connectedAccount = connection.createConnection(user_id, body.friend_sync, userInfo, token);
		await connectedAccount.save();

		const d = {
			event: "USER_CONNECTIONS_UPDATE",
			user_id,
			data: {}
		} as UserConnectionsUpdateEvent;
		await emitEvent(d);
	}

	res.sendStatus(204);
});

export default router;
