import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { FieldErrors, Release } from "@fosscord/util";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const platform = req.query.platform;

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

	res.json({
		name: release.name,
		pub_date: release.pub_date,
		url: release.url,
		notes: release.notes,
	});
});

export default router;
