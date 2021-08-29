import { Router, Request, Response } from "express";
import { UserModel, toObject, PublicUserProjection } from "@fosscord/util";
import { getPublicUser } from "../../../util/User";
import { UserModifySchema } from "../../../schema/User";
import { check } from "../../../util/instanceOf";
import { handleFile } from "../../../util/cdn";
import { regexpCode } from "ajv/dist/compile/codegen";
import jwt from "jsonwebtoken";
import { Config } from "@fosscord/util";

const router: Router = Router();

router.get("/", async (req: Request, res: Response) => {
	console.log(req.url);
	if(req.url == "/?with_analytics_token=true") {
		const userWithAnalyticsToken = {
			accent_color: null,
			analytics_token: await generateToken(req.user_id),
			avatar: (await getPublicUser(req.user_id)).avatar,
			banner: (await getPublicUser(req.user_id)).banner,
			banner_color: null, //TODO ?
			bio: (await getPublicUser(req.user_id)).bio,
			discriminator: (await getPublicUser(req.user_id)).discriminator,
			email: (await getPublicUser(req.user_id)).email,
			flags: (await getPublicUser(req.user_id)).flags,
			id: req.user_id,
			locale: "fr", //TODO ?
			mfa_enabled: (await getPublicUser(req.user_id)).mfa_enabled,
			nsfw_allowed: (await getPublicUser(req.user_id)).nsfw_allowed,
			phone: (await getPublicUser(req.user_id)).phone,
			premium_type: (await getPublicUser(req.user_id)).premium_type,
			premium_usage_flags: 0, //TODO ?
			public_flags: (await getPublicUser(req.user_id)).public_flags,
			purchased_flags: 0, //TODO ?
			username: (await getPublicUser(req.user_id)).username,
			verified: (await getPublicUser(req.user_id)).verified, //without verified email you can't access to applications
		};
		res.json(userWithAnalyticsToken);
		res.status(200);
		return;
	}
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

	const user = await UserModel.findOneAndUpdate({ id: req.user_id }, body, { projection: UserUpdateProjection, new: true }).exec();
	// TODO: dispatch user update event
	res.json(toObject(user));
});

export async function generateToken(id: string) {
	const iat = Math.floor(Date.now() / 1000);
	const algorithm = "HS256";

	return new Promise((res, rej) => {
		jwt.sign(
			{ id: id, iat },
			Config.get().security.jwtSecret,
			{
				algorithm
			},
			(err, token) => {
				if (err) return rej(err);
				return res(token);
			}
		);
	});
}

export default router;
// {"message": "Invalid two-factor code", "code": 60008}
