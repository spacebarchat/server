import { ChannelDeleteEvent, ChannelModel, ChannelUpdateEvent, getPermission, GuildUpdateEvent, toObject } from "@fosscord/server-util";
import { Router } from "express";
import { HTTPError } from "lambert-server";
import { ChannelModifySchema } from "../../../schema/Channel";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
const router: Router = Router();
// TODO: delete channel
// TODO: Get channel

router.delete("/", async (req, res) => {
	const { channel_id } = req.params

	const channel = await ChannelModel.findOne({ id: channel_id }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);
	if (channel.guild_id) {

		const permission = await getPermission(req.user_id, channel.guild_id)
		permission.hasThrow("MANAGE_CHANNELS")
	}

	// TODO Channel Update Gateway event will fire for each of them

	await ChannelModel.deleteOne({ id: channel_id })

	// TODO: Dm channel "close" not delete
	
	await emitEvent({ event: "CHANNEL_DELETE", data: channel, guild_id: channel_id, channel_id} as ChannelDeleteEvent);

	const data = toObject(channel);
	//TODO: Reload channel list if request successful
	res.send(data)
})

// should be good now

router.patch("/", check(ChannelModifySchema), async (req, res) => {
	var payload = req.body as ChannelModifySchema //new data 
	const { channel_id } = req.params
	var channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);

	const permission = await getPermission(req.user_id, channel.guild_id, channel_id)
	permission.hasThrow("MANAGE_CHANNELS")
	channel = await ChannelModel.findOneAndUpdate({ id: channel_id }, payload).exec()
	if (!channel) throw new HTTPError("Channel not found", 404);

	//const data = toObject(channel);
	//TODO: Reload channel list if request successful

	await emitEvent({
		event: "CHANNEL_UPDATE",
		data: channel,
		guild_id: channel.guild_id,
	} as ChannelUpdateEvent)

	res.send(toObject(channel));
})

export default router;

