import { Router, Response, Request } from "express";
import {
	ChannelCreateEvent,
	ChannelModel,
	ChannelType,
	GuildModel,
	Snowflake,
	toObject,
	ChannelUpdateEvent,
	AnyChannel
} from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { ChannelModifySchema } from "../../../schema/Channel";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
import { createChannel } from "../../../util/Channel";
const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const channels = await ChannelModel.find({ guild_id }).exec();

	res.json(toObject(channels));
});

router.post("/", check(ChannelModifySchema), async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const body = req.body as ChannelModifySchema;

	const channel = await createChannel({ ...body, guild_id }, req.user_id);

	res.json(channel);
});

router.patch("/", check(ChannelModifySchema), async (req: Request, res: Response) => {
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
