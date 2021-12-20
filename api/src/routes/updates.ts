import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";
import { Config, Relase } from "@fosscord/util";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
  const { client } = Config.get();

  const relase = await Relase.findOneOrFail({
    name: client.relases.upstreamVersion,
  });

  res.json({
    name: relase.name,
    pub_date: relase.pub_date,
    url: relase.url,
    notes: relase.notes,
  });
});

export default router;
