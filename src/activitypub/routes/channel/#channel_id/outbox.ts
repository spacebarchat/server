import { makeOrderedCollection } from "@spacebar/ap";
import { route } from "@spacebar/api";
import { Config, Message, Snowflake } from "@spacebar/util";
import { Router } from "express";
import { FindManyOptions, FindOperator, LessThan, MoreThan } from "typeorm";

const router = Router();
export default router;

router.get("/", route({}), async (req, res) => {
	// TODO: authentication

	const { channel_id } = req.params;
	const { page, min_id, max_id } = req.query;

	const { webDomain } = Config.get().federation;

	const ret = makeOrderedCollection(
		req,
		`https://${webDomain}/fed/channels/${channel_id}/outbox`,
		() => Message.count({ where: { channel_id } }),
		async (before, after) => {
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

			return messages.map((x) => ({
				...x,
				toAP: () => x.toAnnounceAP(),
			}));
		},
	);

	return res.json(ret);
});
