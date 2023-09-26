import {
	makeOrderedCollection,
	transformMessageToAnnounceNoce,
} from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Config, Message, Snowflake } from "@spacebar/util";
import { APAnnounce } from "activitypub-types";
import { Request, Response, Router } from "express";
import { FindManyOptions, FindOperator, LessThan, MoreThan } from "typeorm";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	const { page, min_id, max_id } = req.query;

	const { host } = Config.get().federation;

	const ret = await makeOrderedCollection({
		page: page != undefined,
		min_id: min_id?.toString(),
		max_id: max_id?.toString(),
		id: `https://${host}/federation/channels/${channel_id}/outbox`,
		getTotalElements: () => Message.count({ where: { channel_id } }),
		getElements: async (before, after): Promise<APAnnounce[]> => {
			const query: FindManyOptions<Message> & {
				where: { id?: FindOperator<string> | FindOperator<string>[] };
			} = {
				order: { timestamp: "DESC" },
				take: 20,
				where: { channel_id: channel_id },
				relations: ["author"],
			};

			if (after) {
				if (BigInt(after) > BigInt(Snowflake.generate())) return [];
				query.where.id = MoreThan(after);
			} else if (before) {
				if (BigInt(before) > BigInt(Snowflake.generate())) return [];
				query.where.id = LessThan(before);
			}

			const messages = await Message.find(query);

			return await Promise.all(
				messages.map((x) => transformMessageToAnnounceNoce(x)),
			);
		},
	});

	return res.json(ret);
});

export default router;
