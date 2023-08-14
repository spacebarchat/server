import { route } from "@spacebar/api";
import { Config, Member } from "@spacebar/util";
import { makeOrderedCollection } from "activitypub/util/OrderedCollection";
import { Router } from "express";

const router = Router();
export default router;

router.get("/", route({}), async (req, res) => {
	// TODO auth
	const { channel_id } = req.params;

	const { webDomain } = Config.get().federation;

	const ret = makeOrderedCollection(
		req,
		`https://${webDomain}/fed/channels/${channel_id}/followers`,
		() =>
			Member.count({
				where: { guild: { channels: { id: channel_id } } },
			}),
		async (before, after) => {
			return [];
		},
	);

	return res.json(ret);
});
