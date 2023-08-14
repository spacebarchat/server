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

	if (!page)
		return res.json({
			"@context": "https://www.w3.org/ns/activitystreams",
			id: `https://${webDomain}/fed/users/${channel_id}/outbox`,
			type: "OrderedCollection",
			first: `https://${webDomain}/fed/users/${channel_id}/outbox?page=true`,
			last: `https://${webDomain}/fed/users/${channel_id}/outbox?page=true&min_id=0`,
		});

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

	return res.json({
		"@context": "https://www.w3.org/ns/activitystreams",
		id: `https://${webDomain}/fed/channel/${channel_id}/outbox?page=true`,
		type: "OrderedCollection",
		next: `https://${webDomain}/fed/channel/${channel_id}/outbox?page=true&max_id=${
			messages[0]?.id || "0"
		}`,
		prev: `https://${webDomain}/fed/channel/${channel_id}/outbox?page=true&max_id=${
			messages[messages.length - 1]?.id || "0"
		}`,
		partOf: `https://${webDomain}/fed/channel/${channel_id}/outbox`,
		orderedItems: messages.map((message) => ({
			id: `https://${webDomain}/fed/channel/${channel_id}/message/${message.id}`,
			type: "Announce", // hmm
			actor: `https://${webDomain}/fed/channel/${channel_id}`,
			published: message.timestamp,
			to: ["https://www.w3.org/ns/activitystreams#Public"],
			cc: [
				message.author?.id
					? `https://${webDomain}/fed/users/${message.author.id}`
					: undefined,
				`https://${webDomain}/fed/channel/${channel_id}/followers`,
			],
			object: `https://${webDomain}/fed/channel/${channel_id}/messages/${message.id}`,
		})),
	});
});
