import { route, random } from "@fosscord/api";
import { Config, ValidRegistrationToken } from "@fosscord/util";
import { Request, Response, Router } from "express";

const router: Router = Router();
export default router;

router.get(
	"/",
	route({ right: "OPERATOR" }),
	async (req: Request, res: Response) => {
		const count = req.query.count ? parseInt(req.query.count as string) : 1;
		const length = req.query.length
			? parseInt(req.query.length as string)
			: 255;

		const tokens: ValidRegistrationToken[] = [];

		for (let i = 0; i < count; i++) {
			const token = ValidRegistrationToken.create({
				token: random(length),
				expires_at:
					Date.now() +
					Config.get().security.defaultRegistrationTokenExpiration,
			});
			tokens.push(token);
		}

		// Why are these options used, exactly?
		await ValidRegistrationToken.save(tokens, {
			chunk: 1000,
			reload: false,
			transaction: false,
		});

		const ret = req.query.include_url
			? tokens.map(
					(x) =>
						`${Config.get().general.frontPage}/register?token=${
							x.token
						}`,
			  )
			: tokens.map((x) => x.token);

		if (req.query.plain) return res.send(ret.join("\n"));

		return res.json({ tokens: ret });
	},
);
