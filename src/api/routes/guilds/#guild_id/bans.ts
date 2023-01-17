import { Request, Response, Router } from "express";
import {
	DiscordApiErrors,
	emitEvent,
	GuildBanAddEvent,
	GuildBanRemoveEvent,
	Ban,
	User,
	Member,
	BanRegistrySchema,
	BanModeratorSchema,
} from "@fosscord/util";
import { HTTPError } from "lambert-server";
import { getIpAdress, route } from "@fosscord/api";

const router: Router = Router();

/* TODO: Deleting the secrets is just a temporary go-around. Views should be implemented for both safety and better handling. */

router.get(
	"/",
	route({ permission: "BAN_MEMBERS" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;

		const bans = await Ban.find({ where: { guild_id: guild_id } });
		const promisesToAwait: object[] = [];
		const bansObj: object[] = [];

		bans.filter((ban) => ban.user_id !== ban.executor_id); // pretend self-bans don't exist to prevent victim chasing

		bans.forEach((ban) => {
			promisesToAwait.push(User.getPublicUser(ban.user_id));
		});

		const bannedUsers: object[] = await Promise.all(promisesToAwait);

		bans.forEach((ban, index) => {
			const user = bannedUsers[index] as User;
			bansObj.push({
				reason: ban.reason,
				user: {
					username: user.username,
					discriminator: user.discriminator,
					id: user.id,
					avatar: user.avatar,
					public_flags: user.public_flags,
				},
			});
		});

		return res.json(bansObj);
	},
);

router.get(
	"/:user",
	route({ permission: "BAN_MEMBERS" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const user_id = req.params.ban;

		let ban = (await Ban.findOneOrFail({
			where: { guild_id: guild_id, user_id: user_id },
		})) as BanRegistrySchema;

		if (ban.user_id === ban.executor_id) throw DiscordApiErrors.UNKNOWN_BAN;
		// pretend self-bans don't exist to prevent victim chasing

		/* Filter secret from registry. */

		ban = ban as BanModeratorSchema;

		delete ban.ip;

		return res.json(ban);
	},
);

router.put(
	"/:user_id",
	route({ body: "BanCreateSchema", permission: "BAN_MEMBERS" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const banned_user_id = req.params.user_id;

		if (
			req.user_id === banned_user_id &&
			banned_user_id === req.permission!.cache.guild?.owner_id
		)
			throw new HTTPError(
				"You are the guild owner, hence can't ban yourself",
				403,
			);

		if (req.permission!.cache.guild?.owner_id === banned_user_id)
			throw new HTTPError("You can't ban the owner", 400);

		const banned_user = await User.getPublicUser(banned_user_id);

		const ban = Ban.create({
			user_id: banned_user_id,
			guild_id: guild_id,
			ip: getIpAdress(req),
			executor_id: req.user_id,
			reason: req.body.reason, // || otherwise empty
		});

		await Promise.all([
			Member.removeFromGuild(banned_user_id, guild_id),
			ban.save(),
			emitEvent({
				event: "GUILD_BAN_ADD",
				data: {
					guild_id: guild_id,
					user: banned_user,
				},
				guild_id: guild_id,
			} as GuildBanAddEvent),
		]);

		return res.json(ban);
	},
);

router.put(
	"/@me",
	route({ body: "BanCreateSchema" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;

		const banned_user = await User.getPublicUser(req.params.user_id);

		if (req.permission!.cache.guild?.owner_id === req.params.user_id)
			throw new HTTPError(
				"You are the guild owner, hence can't ban yourself",
				403,
			);

		const ban = Ban.create({
			user_id: req.params.user_id,
			guild_id: guild_id,
			ip: getIpAdress(req),
			executor_id: req.params.user_id,
			reason: req.body.reason, // || otherwise empty
		});

		await Promise.all([
			Member.removeFromGuild(req.user_id, guild_id),
			ban.save(),
			emitEvent({
				event: "GUILD_BAN_ADD",
				data: {
					guild_id: guild_id,
					user: banned_user,
				},
				guild_id: guild_id,
			} as GuildBanAddEvent),
		]);

		return res.json(ban);
	},
);

router.delete(
	"/:user_id",
	route({ permission: "BAN_MEMBERS" }),
	async (req: Request, res: Response) => {
		const { guild_id, user_id } = req.params;

		const ban = await Ban.findOneOrFail({
			where: { guild_id: guild_id, user_id: user_id },
		});

		if (ban.user_id === ban.executor_id) throw DiscordApiErrors.UNKNOWN_BAN;
		// make self-bans irreversible and hide them from view to avoid victim chasing

		const banned_user = await User.getPublicUser(user_id);

		await Promise.all([
			Ban.delete({
				user_id: user_id,
				guild_id,
			}),

			emitEvent({
				event: "GUILD_BAN_REMOVE",
				data: {
					guild_id,
					user: banned_user,
				},
				guild_id,
			} as GuildBanRemoveEvent),
		]);

		return res.status(204).send();
	},
);

export default router;
