import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { AckBulkSchema, ReadState } from "@fosscord/util";
const router = Router();

router.post(
	"/",
	route({ body: "AckBulkSchema" }),
	async (req: Request, res: Response) => {
		const body = req.body as AckBulkSchema;

		// TODO: what is read_state_type ?

		await Promise.all([
			// for every new state
			...body.read_states.map(async (x) => {
				// find an existing one
				const ret =
					(await ReadState.findOne({
						where: {
							user_id: req.user_id,
							channel_id: x.channel_id,
						},
					})) ??
					// if it doesn't exist, create it (not a promise)
					ReadState.create({
						user_id: req.user_id,
						channel_id: x.channel_id,
					});

				ret.last_message_id = x.message_id;

				return ret.save();
			}),
		]);

		return res.status(204);
	},
);

export default router;
