
import { Guild, Config } from "@fosscord/util";

import { Router, Request, Response } from "express";
import { route } from "@fosscord/api";

const router = Router();

router.get("/", route({}), async (req: Request, res: Response) => {
	const { guild_id } = req.params;	
    // TODO:
    // Load from database
    // Admin control, but for now it allows anyone to be discoverable

	res.send({
		guild_id: guild_id,
		safe_environment: true,
        healthy: true,
        health_score_pending: false,
        size: true,
        nsfw_properties: {},
        protected: true,
        sufficient: true,
        sufficient_without_grace_period: true,
        valid_rules_channel: true,
        retention_healthy: true,
        engagement_healthy: true,
        age: true,
        minimum_age: 0,
        health_score: {
            avg_nonnew_participators: 0,
            avg_nonnew_communicators: 0,
            num_intentful_joiners: 0,
            perc_ret_w1_intentful: 0
        },
        minimum_size: 0
	});
});

export default router;
