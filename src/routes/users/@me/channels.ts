import {
	Router,
	Request,
	Response
} from "express";
import {
	ChannelModel,
	ChannelCreateEvent,
	DMChannel,
	UserModel,
	toObject,
	ChannelType,
	Snowflake
} from "@fosscord/server-util";
import {
	HTTPError
} from "lambert-server";
import {
	emitEvent
} from "../../../util/Event";
import {
	getPublicUser
} from "../../../util/User";
import {
	DmChannelCreateSchema
} from "../../../schema/Channel";
import {
	check
} from "../../../util/instanceOf";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const user = await UserModel.findOne({
		id: req.user_id
	}, {
		guilds: true
	}).exec();
	if (!user) throw new HTTPError("User not found", 404);

	var testID = "829044530203328513"; //FOR TEST

	var channels = await ChannelModel.find({
		recipients: req.user_id,
		type: 1
	}).exec();

	res.json(toObject(channels));
});

router.post("/", check(DmChannelCreateSchema), async (req, res) => {
	const body = req.body as DmChannelCreateSchema;

	const channel = {
		...body,
		owner_id: req.user_id,
		id: Snowflake.generate(),
		type: ChannelType.DM,
		created_at: new Date(),
	};
	await new ChannelModel(channel).save();

	/*Event({ event: "CHANNEL_CREATE", data: channel } as ChannelCreateEvent);*/


	res.json(channel);
});

export default router;