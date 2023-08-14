import { route } from "@spacebar/api";
import { Config, Message, Snowflake } from "@spacebar/util";
import { APOrderedCollection } from "activitypub-types";
import { Router } from "express";
import { FindManyOptions, FindOperator, LessThan, MoreThan } from "typeorm";

const router = Router();
export default router;

router.get("/", route({}), async (req, res) => {
	// TODO: authentication

	const { channel_id } = req.params;
	const { page, min_id, max_id } = req.query;

	const { webDomain } = Config.get().federation;

	if (!page) {
		const ret: APOrderedCollection = {
			"@context": "https://www.w3.org/ns/activitystreams",
			id: `https://${webDomain}/fed/channel/${channel_id}/outbox`,
			type: "OrderedCollection",
			first: `https://${webDomain}/fed/channel/${channel_id}/outbox?page=true`,
			last: `https://${webDomain}/fed/channel/${channel_id}/outbox?page=true&min_id=0`,
		};
		return res.json(ret);
	}

	const after = min_id ? `${min_id}` : undefined;
	const before = max_id ? `${max_id}` : undefined;

	const query: FindManyOptions<Message> & {
		where: { id?: FindOperator<string> | FindOperator<string>[] };
	} = {
		order: { timestamp: "DESC" },
		take: 20,
		where: { channel_id: channel_id },
		relations: ["author"],
	};

	if (after) {
		if (BigInt(after) > BigInt(Snowflake.generate()))
			return res.status(422);
		query.where.id = MoreThan(after);
	} else if (before) {
		if (BigInt(before) > BigInt(Snowflake.generate()))
			return res.status(422);
		query.where.id = LessThan(before);
	}

	const messages = await Message.find(query);

	// move this to like, Channel.createAPMessages or smth
	const apMessages = messages.map((message) => ({
		id: `https://${webDomain}/fed/channel/${message.channel_id}/messages/${message.id}`,
		type: "Announce",
		actor: `https://${webDomain}/fed/user/${message.author_id}`,
		published: message.timestamp,
		to: `https://${webDomain}/fed/channel/${message.channel_id}`,
		object: message.toAP(),
	}));

	const ret: APOrderedCollection = {
		"@context": "https://www.w3.org/ns/activitystreams",
		id: `https://${webDomain}/fed/channel/${channel_id}/outbox?page=true`,
		type: "OrderedCollection",
		first: `https://${webDomain}/fed/channel/${channel_id}/outbox?page=true`,
		last: `https://${webDomain}/fed/channel/${channel_id}/outbox?page=true&min_id=0`,
		totalItems: await Message.count({ where: { channel_id } }),
		items: apMessages,
	};

	return res.json(ret);
});
