import { Request, Response, Router } from "express";
import { GuildModel, MemberModel, UserModel, toObject, GuildMemberAddEvent } from "@fosscord/server-util";
import { HTTPError } from "lambert-server";
import { instanceOf, Length } from "../../../util/instanceOf";
import { PublicMemberProjection, addMember, removeMember, addRole, removeRole } from "../../../util/Member";
import { emitEvent } from "../../../util/Event";
import { getPublicUser } from "../../../util/User";

const router = Router();

// TODO: not allowed for user -> only allowed for bots with privileged intents
// TODO: send over websocket
router.get("/", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	try {
		instanceOf({ $limit: new Length(Number, 1, 1000), $after: String }, req.query, {
			path: "query",
			req,
			ref: { obj: null, key: "" },
		});
	} catch (error) {
		return res.status(400).json({ code: 50035, message: "Invalid Query", success: false, errors: error });
	}

	// @ts-ignore
	if (!req.query.limit) req.query.limit = 1;
	const { limit, after } = (<unknown>req.query) as { limit: number; after: string };
	const query = after ? { id: { $gt: after } } : {};

	var members = await MemberModel.find({ guild_id, ...query }, PublicMemberProjection)
		.limit(limit)
		.exec();

	return res.json(toObject(members));
});

router.get("/:member", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const user_id = req.params.member;

	const member = await MemberModel.findOne({ id: user_id, guild_id }).exec();
	if (!member) throw new HTTPError("Member not found", 404);

	return res.json(member);
});

router.put("/:member", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	const user_id = req.params.member;

	const user = await UserModel.findOne({ id: user_id }).exec();
	if (!user) throw new HTTPError("User not found", 404);

	await addMember(user_id, guild_id);

	// https://discord.com/developers/docs/resources/guild#add-guild-member
});


router.delete("/:member", async (req: Request, res: Response) => {
	const { guild_id } = req.params;
	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	const user_id = req.params.member;

	const member = await MemberModel.findOne({ id: user_id, guild_id }).exec();
	if (!member) throw new HTTPError("Member not found", 404);

	await removeMember(user_id, guild_id);

	// https://discord.com/developers/docs/resources/guild#remove-guild-member
});

router.delete("/:member/roles/:role_id", async (req: Request, res: Response) => {

	const { guild_id, role_id } = req.params;
	if(!role_id) throw new HTTPError("role_id not defined", 404);

	const guild = await GuildModel.findOne({ id: guild_id }).exec();
	if (!guild) throw new HTTPError("Guild not found", 404);

	const user_id = req.params.member;

	const member = await MemberModel.findOne({ id: user_id, guild_id }).exec();
	if (!member) throw new HTTPError("Member not found", 404);

	await removeRole(user_id, guild_id, role_id);

	// https://discord.com/developers/docs/resources/guild#remove-guild-member-role
});


export default router;
