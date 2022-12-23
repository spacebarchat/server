import { route } from "@fosscord/api";
import { ConnectedAccount, DiscordApiErrors, emitEvent } from "@fosscord/util";
import { Request, Response, Router } from "express";
const router = Router();

// TODO: connection update schema
router.patch(
	"/",
	route({ body: "ConnectionUpdateSchema" }),
	async (req: Request, res: Response) => {
		const { connection_name, connection_id } = req.params;

		const connection = await ConnectedAccount.findOne({
			where: {
				user_id: req.user_id,
				external_id: connection_id,
				type: connection_name,
			},
			select: [
				"external_id",
				"type",
				"name",
				"verified",
				"visibility",
				"show_activity",
				"revoked",
				"friend_sync",
				"integrations",
			],
		});

		if (!connection) return DiscordApiErrors.UNKNOWN_CONNECTION;
		// TODO: do we need to do anything if the connection is revoked?
		connection.assign(req.body);
		await ConnectedAccount.update(
			{
				user_id: req.user_id,
				external_id: connection_id,
				type: connection_name,
			},
			connection,
		);
		res.json(connection.toJSON());
	},
);

router.delete("/", route({}), async (req: Request, res: Response) => {
	const { connection_name, connection_id } = req.params;

	const account = await ConnectedAccount.findOneOrFail({
		where: {
			user_id: req.user_id,
			external_id: connection_id,
			type: connection_name,
		}
	});

	await Promise.all([
		ConnectedAccount.remove(account),
		emitEvent({
			event: "USER_CONNECTIONS_UPDATE",
			data: account,
			user_id: req.user_id,
		})
	]);

	return res.sendStatus(200);
});

export default router;
