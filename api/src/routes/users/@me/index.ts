import { Router, Request, Response } from "express";
import { User, toObject, PublicUserProjection } from "@fosscord/util";
import { getPublicUser } from "../../../util/User";
import { UserModifySchema } from "../../../schema/User";
import { check } from "../../../util/instanceOf";
import { handleFile } from "../../../util/cdn";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	res.json(await getPublicUser(req.user_id));
});

const UserUpdateProjection = {
	accent_color: true,
	avatar: true,
	banner: true,
	bio: true,
	bot: true,
	discriminator: true,
	email: true,
	flags: true,
	id: true,
	locale: true,
	mfa_enabled: true,
	nsfw_alllowed: true,
	phone: true,
	public_flags: true,
	purchased_flags: true,
	// token: true, // this isn't saved in the db and needs to be set manually
	username: true,
	verified: true
};

router.patch("/", check(UserModifySchema), async (req: Request, res: Response) => {
	const body = req.body as UserModifySchema;

	if (body.avatar) body.avatar = await handleFile(`/avatars/${req.user_id}`, body.avatar as string);
	if (body.banner) body.banner = await handleFile(`/banners/${req.user_id}`, body.banner as string);

	const user = await User.findOneOrFailAndUpdate({ id: req.user_id }, body, { projection: UserUpdateProjection, new: true });
	// TODO: dispatch user update event

	res.json(user);
});

export default router;
// {"message": "Invalid two-factor code", "code": 60008}
