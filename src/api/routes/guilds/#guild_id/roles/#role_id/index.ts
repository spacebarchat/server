import { Router, Request, Response } from "express";
import { Role, Member, GuildRoleUpdateEvent, GuildRoleDeleteEvent, emitEvent, handleFile, RoleModifySchema } from "@fosscord/util";
import { route } from "@fosscord/api";
import { HTTPError } from "lambert-server";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id, role_id } = req.params;
	await Member.IsInGuildOrFail(req.user_id, guild_id);
	const role = await Role.findOneOrFail({ where: { guild_id, id: role_id } });
	return res.json(role);
});

router.delete("/", route({ permission: "MANAGE_ROLES" }), async (req: Request, res: Response) => {
	const { guild_id, role_id } = req.params;
	if (role_id === guild_id) throw new HTTPError("You can't delete the @everyone role");

	await Promise.all([
		Role.delete({
			id: role_id,
			guild_id: guild_id
		}),
		emitEvent({
			event: "GUILD_ROLE_DELETE",
			guild_id,
			data: {
				guild_id,
				role_id
			}
		} as GuildRoleDeleteEvent)
	]);

	res.sendStatus(204);
});

// TODO: check role hierarchy

router.patch("/", route({ body: "RoleModifySchema", permission: "MANAGE_ROLES" }), async (req: Request, res: Response) => {
	const { role_id, guild_id } = req.params;
	const body = req.body as RoleModifySchema;

	if (body.icon && body.icon.length) body.icon = await handleFile(`/role-icons/${role_id}`, body.icon as string);
	else body.icon = undefined;

	const role = Role.create({
		...body,
		id: role_id,
		guild_id,
		permissions: String(req.permission!.bitfield & BigInt(body.permissions || "0"))
	});

	await Promise.all([
		role.save(),
		emitEvent({
			event: "GUILD_ROLE_UPDATE",
			guild_id,
			data: {
				guild_id,
				role
			}
		} as GuildRoleUpdateEvent)
	]);

	res.json(role);
});

export default router;
