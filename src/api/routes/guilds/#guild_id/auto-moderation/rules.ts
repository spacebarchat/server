/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2024 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { route } from "@spacebar/api";
import { AutomodRule } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { AutomodRuleModifySchema, AutomodRuleSchema } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

async function getNextAutomodRulePosition(guild_id: string) {
    const result = await AutomodRule.createQueryBuilder("automod_rule")
        .select("COALESCE(MAX(automod_rule.position), -1) + 1", "position")
        .where("automod_rule.guild_id = :guild_id", { guild_id })
        .getRawOne<{ position?: number | string }>();

    return Number(result?.position ?? 0);
}

router.get(
    "/",
    route({
        permission: ["MANAGE_GUILD"],
        responses: {
            200: {
                body: "AutomodRulesResponse",
            },
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id } = req.params as { [key: string]: string };
        const rules = await AutomodRule.find({ where: { guild_id } });
        return res.json(rules);
    },
);

router.post(
    "/",
    route({
        requestBody: "AutomodRuleSchema",
        permission: ["MANAGE_GUILD"],
        responses: {
            200: {
                body: "AutomodRuleResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id } = req.params as { [key: string]: string };

        if (req.body.id) {
            throw new HTTPError("You can't specify an ID for a new rule", 400);
        }

        const data = req.body as AutomodRuleSchema;

        const created = AutomodRule.create({
            enabled: false,
            exempt_channels: [],
            exempt_roles: [],
            trigger_metadata: null,
            ...data,
            creator_id: req.user_id,
            guild_id,
            position: await getNextAutomodRulePosition(guild_id),
        });

        const savedRule = await AutomodRule.save(created);
        return res.json(savedRule);
    },
);

router.patch(
    "/:rule_id",
    route({
        requestBody: "AutomodRuleModifySchema",
        permission: ["MANAGE_GUILD"],
        responses: {
            200: {
                body: "AutomodRuleResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id, rule_id } = req.params as { [key: string]: string };
        const rule = await AutomodRule.findOneOrFail({
            where: { guild_id, id: rule_id },
        });

        const data = req.body as AutomodRuleModifySchema;

        AutomodRule.merge(rule, data);
        const savedRule = await AutomodRule.save(rule);
        return res.json(savedRule);
    },
);

router.delete(
    "/:rule_id",
    route({
        permission: ["MANAGE_GUILD"],
        responses: {
            204: {},
            403: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id, rule_id } = req.params as { [key: string]: string };
        await AutomodRule.delete({ guild_id, id: rule_id });
        return res.status(204).send();
    },
);

export default router;
