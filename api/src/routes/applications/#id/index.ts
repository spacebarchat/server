import { Request, Response, Router } from "express";
import { Application } from "@fosscord/util";
import { route } from "@fosscord/api";

const router: Router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	res.send(await Application.findOneOrFail({ where: { id: req.params.id }, relations: ["owner", "bot"]})
);
});

export default router;