import { Router } from "express";
import { ChannelCreateEvent, ChannelModel, ChannelType, GuildModel, Snowflake, toObject, ChannelUpdateEvent } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { ChannelModifySchema } from "../../../schema/Channel";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
const router = Router();

router.get("/", async (req, res) => {
	const { guild_id } = req.params;
	const channels = await ChannelModel.find({ guild_id }).exec();

	res.json(toObject(channels));
});

router.post("/", check(ChannelModifySchema), async (req, res) => {
	const { guild_id } = req.params;
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
		const exists = await ChannelModel.findOne({ id: body.parent_id }, { guild_id: true }).exec();
		if (!exists) throw new HTTPError("Parent id channel doesn't exist", 400);
		if (exists.guild_id !== guild_id) throw new HTTPError("The category channel needs to be in the guild");
	}

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	const channel = {
		...body,
		id: Snowflake.generate(),
		created_at: new Date(),
		guild_id
	};

	await new ChannelModel(channel).save();

	await emitEvent({ event: "CHANNEL_CREATE", data: channel, guild_id } as ChannelCreateEvent);

	res.json(channel);
});

router.patch("/", check(ChannelModifySchema), async (req, res) => {
	const { guild_id } = req.params;
	const body = req.body as ChannelModifySchema;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	const channel = {
		...body
	};
	const channelm = await ChannelModel.find({ guild_id }).exec();
	if (!channelm) throw new HTTPError("Channel not found", 404);

	await new ChannelModel(channel).save();

	await emitEvent({ event: "CHANNEL_UPDATE", data: channel } as ChannelUpdateEvent);

	res.json(channel);
});

export default router;
