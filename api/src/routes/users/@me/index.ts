import { Router, Request, Response } from "express";
import { User } from "@fosscord/util";
import { UserModifySchema } from "../../../schema/User";
import { check } from "../../../util/instanceOf";
import { handleFile } from "../../../util/cdn";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	res.json(await User.getPublicUser(req.user_id));
});

const UserUpdateProjection = [
	"accent_color",
	"avatar",
	"banner",
	"bio",
	"bot",
	"discriminator",
	"email",
	"flags",
	"id",
	"locale",
	"mfa_enabled",
	"nsfw_alllowed",
	"phone",
	"public_flags",
	"purchased_flags",
	// "token", // this isn't saved in the db and needs to be set manually
	"username",
	"verified"
];

router.patch("/", check(UserModifySchema), async (req: Request, res: Response) => {
	const body = req.body as UserModifySchema;

	if (body.avatar) body.avatar = await handleFile(`/avatars/${req.user_id}`, body.avatar as string);
	if (body.banner) body.banner = await handleFile(`/banners/${req.user_id}`, body.banner as string);

	const user = await new User({ ...body }, { id: req.user_id }).save();
	// TODO: dispatch user update event

	res.json(user);
});

export default router;
// {"message": "Invalid two-factor code", "code": 60008}
