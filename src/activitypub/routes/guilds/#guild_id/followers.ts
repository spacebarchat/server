import { makeOrderedCollection } from "@spacebar/ap";
import { route } from "@spacebar/api";
import {
	Channel,
	Config,
	Datasource,
	FederationKey,
	Member,
} from "@spacebar/util";
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
		id: `https://${host}/federation/guilds/${guild_id}/following`,
		getTotalElements: () => Channel.count({ where: { guild_id } }),
		getElements: async (before, after): Promise<string[]> => {
			const members = await Datasource.getRepository(FederationKey)
				.createQueryBuilder("key")
				.leftJoin(Member, "member", "member.id == key.actorId")
				.where("member.guild_id = :guild_id", { guild_id })
				.getMany();

			// TODO: actual pagination

			return members.map((x) => x.federatedId);
		},
	});

	return res.json(ret);
});

export default router;
