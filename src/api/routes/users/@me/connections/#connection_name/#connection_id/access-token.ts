import { route } from "@spacebar/api";
import {
	ApiError,
	ConnectedAccount,
	ConnectionStore,
	DiscordApiErrors,
	FieldErrors,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import RefreshableConnection from "../../../../../../../util/connections/RefreshableConnection";
const router = Router();

// TODO: this route is only used for spotify, twitch, and youtube. (battlenet seems to be able to PUT, maybe others also)

// spotify is disabled here because it cant be used
const ALLOWED_CONNECTIONS = ["twitch", "youtube"];

// NOTE: this route has not been extensively tested, as the required connections are not implemented as of writing
router.get("/", route({}), async (req: Request, res: Response) => {
	const { connection_name, connection_id } = req.params;

	const connection = ConnectionStore.connections.get(connection_name);

	if (!ALLOWED_CONNECTIONS.includes(connection_name) || !connection)
		throw FieldErrors({
			provider_id: {
				code: "BASE_TYPE_CHOICES",
				message: req.t("common:field.BASE_TYPE_CHOICES", {
					types: ALLOWED_CONNECTIONS.join(", "),
				}),
			},
		});

	if (!connection.settings.enabled)
		throw FieldErrors({
			provider_id: {
				message: "This connection has been disabled server-side.",
			},
		});

	const connectedAccount = await ConnectedAccount.findOne({
		where: {
			type: connection_name,
			external_id: connection_id,
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
	if (!connectedAccount) throw DiscordApiErrors.UNKNOWN_CONNECTION;
	if (connectedAccount.revoked) throw DiscordApiErrors.CONNECTION_REVOKED;
	if (!connectedAccount.token_data)
		throw new ApiError("No token data", 0, 400);

	let access_token = connectedAccount.token_data.access_token;
	const { expires_at, expires_in, fetched_at } = connectedAccount.token_data;

	if (
		(expires_at && expires_at < Date.now()) ||
		(expires_in && fetched_at + expires_in * 1000 < Date.now())
	) {
		if (!(connection instanceof RefreshableConnection))
			throw new ApiError("Access token expired", 0, 400);
		const tokenData = await connection.refresh(connectedAccount);
		access_token = tokenData.access_token;
	}

	res.json({ access_token });
});

export default router;
