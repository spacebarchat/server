import { route } from "@fosscord/api";
import { emitEvent, getPermission, Guild, HTTPError, Invite, InviteDeleteEvent, PublicInviteRelation, User } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();

router.get("/:code", route({}), async (req: Request, res: Response) => {
	const { code } = req.params;

	const invite = await Invite.findOneOrFail({ where: { code }, relations: PublicInviteRelation });

	res.status(200).send(invite);
});

router.post("/:code", route({ right: "USE_MASS_INVITES" }), async (req: Request, res: Response) => {
	const { code } = req.params;
	const { guild_id } = await Invite.findOneOrFail({ where: { code } });
	const { features } = await Guild.findOneOrFail({ where: { id: guild_id } });
	const { public_flags } = await User.findOneOrFail({ where: { id: req.user_id } });

	if (features.includes("INTERNAL_EMPLOYEE_ONLY") && (public_flags & 1) !== 1)
		throw new HTTPError("Only intended for the staff of this server.", 401);
	if (features.includes("INVITES_DISABLED")) throw new HTTPError("Sorry, this guild has joins closed.", 403);

	const invite = await Invite.joinGuild(req.user_id, code);

	res.json(invite);
});

// * cant use permission of route() function because path doesn't have guild_id/channel_id
router.delete("/:code", route({}), async (req: Request, res: Response) => {
	const { code } = req.params;
	const invite = await Invite.findOneOrFail({ where: { code } });
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
