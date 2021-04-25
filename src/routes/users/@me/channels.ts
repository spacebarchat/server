import { Router, Request, Response } from "express";
import {
	ChannelModel,
	ChannelCreateEvent,
	DMChannel,
	UserModel,
	toObject,
	ChannelType,
	Snowflake,
	trimSpecial,
} from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";
import { getPublicUser } from "../../../util/User";
import { DmChannelCreateSchema } from "../../../schema/Channel";
import { check } from "../../../util/instanceOf";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	var channels = await ChannelModel.find({
		$or: [
			{ recipients: req.user_id, type: ChannelType.DM },
			{ recipients: req.user_id, type: ChannelType.GROUP_DM },
		],
	}).exec();

	res.json(toObject(channels));
});

router.post("/", check(DmChannelCreateSchema), async (req, res) => {
	const body = req.body as DmChannelCreateSchema;
	if (body.recipients.length === 0) throw new HTTPError("You need to specify at least one recipient");
	const type = body.recipients.length === 1 ? ChannelType.DM : ChannelType.GROUP_DM;
	const name = trimSpecial(body.name);

	const channel = {
		name,
		type,
		owner_id: req.user_id,
		id: Snowflake.generate(),
		created_at: new Date(),
	};
	await new ChannelModel(channel).save();

	/*Event({ event: "CHANNEL_CREATE", data: channel } as ChannelCreateEvent);*/

	res.json(channel);
});

export default router;
