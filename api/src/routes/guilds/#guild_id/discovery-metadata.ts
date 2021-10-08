

import { Router, Response, Request } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), (req: Request, res: Response) => {
	// TODO:    
    const guild_id = req.params.guild_id;
	res.json({
        guild_id: guild_id,
        primary_category_id: 0,
        keywords: null,
        emoji_discoverability_enabled: true,
        partner_actioned_timestamp: null,
        partner_application_timestamp: null,
        category_ids: []
    }).status(200);
});

export default router;