// import { route } from "@fosscord/api";
// import { emitEvent, handleFile, OrmUtils, PrivateUserProjection, User, UserUpdateEvent } from "@fosscord/util";
// import { Request, Response, Router } from "express";
// import { UserProfileModifySchema } from "../../../../util/schemas/UserProfileModifySchema";

// const router: Router = Router();

// router.patch("/", route({ body: "UserProfileModifySchema" }), async (req: Request, res: Response) => {
// 	const body = req.body as UserProfileModifySchema;

// 	if (body.banner) body.banner = await handleFile(`/banners/${req.user_id}`, body.banner as string);
// 	let user = await User.findOneOrFail({ where: { id: req.user_id }, select: [...PrivateUserProjection, "data"] });

// 	user = OrmUtils.mergeDeep(user, body);
// 	await user.save();

// 	// @ts-ignore
// 	delete user.data;

// 	// TODO: send update member list event in gateway
// 	await emitEvent({
// 		event: "USER_UPDATE",
// 		user_id: req.user_id,
// 		data: user
// 	} as UserUpdateEvent);

// 	res.json({
// 		accent_color: user.accent_color,
// 		bio: user.bio,
// 		banner: user.banner
// 	});
// });

// export default router;
