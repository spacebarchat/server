import { Router, Request, Response } from "express";
import { emitEvent, getPermission, Guild, Invite, InviteDeleteEvent, Member, PublicInviteRelation } from "@fosscord/util";
import { route } from "@fosscord/api";
import { HTTPError } from "lambert-server";

const router: Router = Router();

router.get("/:code", route({}), async (req: Request, res: Response) => {
	const { code } = req.params;

	const invite = await Invite.findOneOrFail({ where: { code }, relations: PublicInviteRelation });

	res.status(200).send(invite);
});

router.post("/:code", route({}), async (req: Request, res: Response) => {
	const { code } = req.params;
	const invite = await Invite.joinGuild(req.user_id, code);

	res.json(invite);
});

// * cant use permission of route() function because path doesn't have guild_id/channel_id
router.delete("/:code", route({}), async (req: Request, res: Response) => {
	const { code } = req.params;
	const invite = await Invite.findOneOrFail({ code });
	const { guild_id, channel_id } = invite;

	const permission = await getPermission(req.user_id, guild_id, channel_id);

	if (!permission.has("MANAGE_GUILD") && !permission.has("MANAGE_CHANNELS"))
		throw new HTTPError("You missing the MANAGE_GUILD or MANAGE_CHANNELS permission", 401);

	await Promise.all([
		Invite.delete({ code }),
		emitEvent({
			event: "INVITE_DELETE",
			guild_id: guild_id,
			data: {
				channel_id: channel_id,
				guild_id: guild_id,
				code: code
			}
		} as InviteDeleteEvent)
	]);

	res.json({ invite: invite });
});

export default router;
