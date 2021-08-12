import { Request, Response, Router } from "express";
import {
	RoleModel,
	GuildModel,
	getPermission,
	toObject,
	UserModel,
	Snowflake,
	MemberModel,
	GuildRoleCreateEvent,
	GuildRoleUpdateEvent,
	GuildRoleDeleteEvent
} from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";
import { check } from "../../../util/instanceOf";
import { RoleModifySchema } from "../../../schema/Roles";
import { getPublicUser } from "../../../util/User";
import { isMember } from "../../../util/Member";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;

	await isMember(req.user_id, guild_id);

	const roles = await RoleModel.find({ guild_id: guild_id }).exec();

	return res.json(toObject(roles));
});

router.post("/", check(RoleModifySchema), async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const body = req.body as RoleModifySchema;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	const user = await UserModel.findOne({ id: req.user_id }).exec();

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_ROLES");
	if (!body.name) throw new HTTPError("You need to specify a name");

	const role = await new RoleModel({
		...body,
		id: Snowflake.generate(),
		guild_id: guild_id,
		managed: false,
		position: 0,
		tags: null,
		permissions: body.permissions || 0n
	}).save();

	await emitEvent({
		event: "GUILD_ROLE_CREATE",
		guild_id,
		data: {
			guild_id,
			role: toObject(role)
		}
	} as GuildRoleCreateEvent);

	res.json(toObject(role));
});

router.delete("/:role_id", async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const { role_id } = req.params;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	const user = await UserModel.findOne({ id: req.user_id }).exec();

	const perms = await getPermission(req.user_id, guild_id);

	if (!perms.has("MANAGE_ROLES")) throw new HTTPError("You missing the MANAGE_ROLES permission", 401);

	await RoleModel.findOneAndDelete({
		id: role_id,
		guild_id: guild_id
	}).exec();

	await emitEvent({
		event: "GUILD_ROLE_DELETE",
		guild_id,
		data: {
			guild_id,
			role_id
		}
	} as GuildRoleDeleteEvent);

	res.sendStatus(204);
});

// TODO: check role hierarchy

router.patch("/:role_id", check(RoleModifySchema), async (req: Request, res: Response) => {
	const guild_id = req.params.guild_id;
	const { role_id } = req.params;
	const body = req.body as RoleModifySchema;

	const guild = await GuildModel.findOne({ id: guild_id }, { id: true }).exec();
	const user = await UserModel.findOne({ id: req.user_id }).exec();

	const perms = await getPermission(req.user_id, guild_id);
	perms.hasThrow("MANAGE_ROLES");

	const role = await RoleModel.findOneAndUpdate(
		{
			id: role_id,
			guild_id: guild_id
		},
		// @ts-ignore
		body
	).exec();

	await emitEvent({
		event: "GUILD_ROLE_UPDATE",
		guild_id,
		data: {
			guild_id,
			role
		}
	} as GuildRoleUpdateEvent);

	res.json(toObject(role));
});

export default router;
