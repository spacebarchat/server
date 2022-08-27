import { Config } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "..";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	const { general } = Config.get();
	res.send({
		ping: "pong!",
		instance: {
			id: general.instanceId,
			name: general.instanceName,
			description: general.instanceDescription,
			image: general.image,

			correspondenceEmail: general.correspondenceEmail,
			correspondenceUserID: general.correspondenceUserID,

			frontPage: general.frontPage,
			tosPage: general.tosPage
		}
	});
});

export default router;
