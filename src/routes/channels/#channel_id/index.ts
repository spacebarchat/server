import { ChannelModel, getPermission, toObject } from "@fosscord/server-util";
import { Router } from "express";
import { HTTPError } from "lambert-server";
const router: Router = Router();
// TODO: delete channel
// TODO: Get channel

router.delete("/", async(req,res)=>{
	const {channel_id} = req.params

	const channel = await ChannelModel.findOne({ id: channel_id }, { guild_id: true, type: true, permission_overwrites: true }).exec();
	if (!channel) throw new HTTPError("Channel not found", 404);
	if (channel.guild_id) {
		const permission = await getPermission(req.user_id, channel.guild_id)
		permission.hasThrow("MANAGE_CHANNELS")
		
		// TODO Channel Update Gateway event will fire for each of them
		await ChannelModel.updateMany({parent_id: channel_id}, {$set: {channel_id: null}}).exec()
		
		await ChannelModel.deleteOne({id: channel_id})
	}
	
	// TODO: Dm channel "close" not delete
	
	const data = toObject(channel);
	//TODO: Reload channel list if request successful
	res.send(data)
})

export default router;
