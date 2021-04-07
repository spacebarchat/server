import { Router } from "express";
import { ChannelCreateEvent, ChannelModel, ChannelType, GuildModel, Snowflake, toObject } from "fosscord-server-util";
import { HTTPError } from "lambert-server";
import { ChannelModifySchema } from "../../../schema/Channel";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
const router = Router();

router.get("/", async (req, res) => {
	const guild_id = req.params.id;
	const channels = await ChannelModel.find({ guild_id }).exec();

	res.json(toObject(channels));
});

router.post("/", check(ChannelModifySchema), async (req, res) => {
	const guild_id = req.params.id;
	const body = req.body as ChannelModifySchema;
	if (!body.permission_overwrites) body.permission_overwrites = [];
	if (!body.topic) body.topic = "";
	if (!body.rate_limit_per_user) body.rate_limit_per_user = 0;
	switch (body.type) {
		case ChannelType.DM:
		case ChannelType.GROUP_DM:
			throw new HTTPError("You can't create a dm channel in a guild");
		// TODO:
		case ChannelType.GUILD_STORE:
			throw new HTTPError("Not yet supported");
		case ChannelType.GUILD_NEWS:
		// TODO: check if guild is community server
	}

	if (body.parent_id) {
		const exists = ChannelModel.findOne({ channel_id: body.parent_id }).exec();
		if (!exists) throw new HTTPError("Parent id channel doesn't exist", 400);
	}

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 4040);

	const channel = {
		...body,
		id: Snowflake.generate(),
		created_at: new Date(),
		guild_id,
	};
	await new ChannelModel(channel).save();

	await emitEvent({ event: "CHANNEL_CREATE", data: channel, guild_id } as ChannelCreateEvent);

	res.json(channel);
});

export default router;
