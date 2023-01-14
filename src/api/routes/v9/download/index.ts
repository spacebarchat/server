import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { FieldErrors, Release } from "@fosscord/util";

const router = Router();

/*
	TODO: Putting the download route in /routes/download.ts doesn't register the route, for some reason
	But putting it here *does*
*/

router.get("/", route({}), async (req: Request, res: Response) => {
	const { platform } = req.query;

	if (!platform)
		throw FieldErrors({
			platform: {
				code: "BASE_TYPE_REQUIRED",
				message: req.t("common:field.BASE_TYPE_REQUIRED"),
			},
		});

	const release = await Release.findOneOrFail({
		where: {
			enabled: true,
			platform: platform as string,
		},
		order: { pub_date: "DESC" },
	});

	res.redirect(release.url);
});

export default router;
