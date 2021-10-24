import { Request, Response, Router } from "express";
import {
	Channel,
	ChannelRecipientAddEvent,
	ChannelType,
	DiscordApiErrors,
	DmChannelDTO,
	emitEvent,
	PublicUserProjection,
	Recipient,
	User
} from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.put("/:user_id", route({}), async (req: Request, res: Response) => {
	const { channel_id, user_id } = req.params;
	const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });

	if (channel.type !== ChannelType.GROUP_DM) {
		const recipients = [...channel.recipients!.map((r) => r.user_id), user_id].unique();

		const new_channel = await Channel.createDMChannel(recipients, req.user_id);
		return res.status(201).json(new_channel);
	} else {
		if (channel.recipients!.map((r) => r.user_id).includes(user_id)) {
			throw DiscordApiErrors.INVALID_RECIPIENT; //TODO is this the right error?
		}

		channel.recipients!.push(new Recipient({ channel_id: channel_id, user_id: user_id }));
		await channel.save();

		await emitEvent({
			event: "CHANNEL_CREATE",
			data: await DmChannelDTO.from(channel, [user_id]),
			user_id: user_id
		});

		await emitEvent({
			event: "CHANNEL_RECIPIENT_ADD",
			data: {
				channel_id: channel_id,
				user: await User.findOneOrFail({ where: { id: user_id }, select: PublicUserProjection })
			},
			channel_id: channel_id
		} as ChannelRecipientAddEvent);
		return res.sendStatus(204);
	}
});

router.delete("/:user_id", route({}), async (req: Request, res: Response) => {
	const { channel_id, user_id } = req.params;
	const channel = await Channel.findOneOrFail({ where: { id: channel_id }, relations: ["recipients"] });
	if (!(channel.type === ChannelType.GROUP_DM && (channel.owner_id === req.user_id || user_id === req.user_id)))
		throw DiscordApiErrors.MISSING_PERMISSIONS;

	if (!channel.recipients!.map((r) => r.user_id).includes(user_id)) {
		throw DiscordApiErrors.INVALID_RECIPIENT; //TODO is this the right error?
	}

	await Channel.removeRecipientFromChannel(channel, user_id);

	return res.sendStatus(204);
});

export default router;
