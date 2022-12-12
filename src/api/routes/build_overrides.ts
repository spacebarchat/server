import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
    let payload: string = req.cookies.buildOverride;

    try {
        res.json(JSON.parse(atob(payload.substring(payload.indexOf(".") + 1))));
    } catch (e) {
        res.json({});
    }
});

router.delete("/", route({}), async (req: Request, res: Response) => {
    res.clearCookie("buildOverride").sendStatus(204);
});

export default router;
