import { Request, Response, Router } from "express";
import {
	Role,
	getPermission,
	Member,
	GuildRoleCreateEvent,
	GuildRoleUpdateEvent,
	emitEvent,
	Config,
	DiscordApiErrors,
	RoleModifySchema,
} from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

export type RolePositionUpdateSchema = {
	id: string;
	position: number;
}[];

router.get("/", route({}), async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;

	await Member.IsInGuildOrFail(req.user_id, guild_id);

	const roles = await Role.find({ where: { guild_id: guild_id } });

	return res.json(roles);
});

router.post(
	"/",
	route({ body: "RoleModifySchema", permission: "MANAGE_ROLES" }),
	async (req: Request, res: Response) => {
		const guild_id = req.params.guild_id;
		const body = req.body as RoleModifySchema;

		const role_count = await Role.count({ where: { guild_id } });
		const { maxRoles } = Config.get().limits.guild;

		if (role_count > maxRoles)
			throw DiscordApiErrors.MAXIMUM_ROLES.withParams(maxRoles);

		const role = Role.create({
			// values before ...body are default and can be overriden
			position: 0,
			hoist: false,
			color: 0,
			mentionable: false,
			...body,
			guild_id: guild_id,
			managed: false,
			permissions: String(
				req.permission!.bitfield & BigInt(body.permissions || "0"),
			),
			tags: undefined,
			icon: undefined,
			unicode_emoji: undefined,
		});

		await Promise.all([
			role.save(),
			emitEvent({
				event: "GUILD_ROLE_CREATE",
				guild_id,
				data: {
					guild_id,
					role: role,
				},
			} as GuildRoleCreateEvent),
		]);

		res.json(role);
	},
);

router.patch(
	"/",
	route({ body: "RolePositionUpdateSchema" }),
	async (req: Request, res: Response) => {
		const { guild_id } = req.params;
		const body = req.body as RolePositionUpdateSchema;

		const perms = await getPermission(req.user_id, guild_id);
		perms.hasThrow("MANAGE_ROLES");

		await Promise.all(
			body.map(async (x) =>
				Role.update({ guild_id, id: x.id }, { position: x.position }),
			),
		);

		const roles = await Role.find({
			where: body.map((x) => ({ id: x.id, guild_id })),
		});

		await Promise.all(
			roles.map((x) =>
				emitEvent({
					event: "GUILD_ROLE_UPDATE",
					guild_id,
					data: {
						guild_id,
						role: x,
					},
				} as GuildRoleUpdateEvent),
			),
		);

		res.json(roles);
	},
);

export default router;
