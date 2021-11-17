import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";
import { Config } from "@fosscord/util";
import { config } from "dotenv"
const router = Router();
const { cdn } = Config.get();

const IdentityForm = {
    cdn: cdn.endpointPublic || process.env.CDN || "http://localhost:3001",
}

router.get("/",route({}), async (req: Request, res: Response) => {
	res.json(IdentityForm)
});

export default router;
