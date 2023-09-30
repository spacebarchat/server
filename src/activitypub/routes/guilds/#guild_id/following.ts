import { makeOrderedCollection, transformChannelToGroup } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Channel, Config } from "@spacebar/util";
import { APGroup } from "activitypub-types";
import { Request, Response, Router } from "express";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const { page, min_id, max_id } = req.query;

	const { host } = Config.get().federation;

	const ret = await makeOrderedCollection({
		page: page != undefined,
		min_id: min_id?.toString(),
		max_id: max_id?.toString(),
		id: `https://${host}/federation/guilds/${guild_id}/followers`,
		getTotalElements: () => Channel.count({ where: { guild_id } }),
		getElements: async (before, after): Promise<APGroup[]> => {
			const channels = await Channel.find({
				where: { guild_id },
				order: { position: "ASC" },
			});

			// TODO: actual pagination

			return Promise.all(channels.map((x) => transformChannelToGroup(x)));
		},
	});

	return res.json(ret);
});

export default router;
