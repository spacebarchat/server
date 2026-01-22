/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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
import { Request, Response, Router } from "express";
import { ReportMenuType, ReportMenuTypeNames } from "../../../schemas/api/reports/ReportMenu";
import path from "path";
import { HTTPError } from "lambert-server";
import { CreateReportSchema } from "../../../schemas/api/reports/CreateReport";
import { FieldErrors } from "@spacebar/util";
import fs from "fs";

const router = Router({ mergeParams: true });

console.log("[Server] Registering reporting menu routes...");
router.get(
    "/",
    route({
        description: "[EXT] Get available reporting menu types.",
        responses: {
            200: {
                body: "Array<ReportMenuTypeNames>",
            },
        },
    }),
    (req: Request, res: Response) => {
        res.json(Object.values(ReportMenuTypeNames));
    },
);

for (const type of Object.values(ReportMenuTypeNames)) {
    router.get(
        `/menu/${type}`,
        route({
            description: `Get reporting menu options for ${type} reports.`,
            query: {
                variant: { type: "string", required: false, description: "Version variant of the menu to retrieve (max 256 characters, default active)" },
            },
            responses: {
                200: {
                    body: "ReportingMenuResponse",
                },
                204: {},
            },
            spacebarOnly: false, // Maps to /reporting/menu/:id
        }),
        (req: Request, res: Response) => {
            // TODO: implement
            // res.send([] as ReportingMenuResponseSchema);
            res.sendFile(path.join(__dirname, "..", "..", "..", "..", "assets", "temp_report_menu_responses", `${type}.json`));
        },
    );
    console.log(`[Server] Route /reporting/menu/${type} registered (reports).`);
    router.post(
        `/${type}`,
        route({
            description: `Get reporting menu options for ${type} reports.`,
            requestBody: "CreateReportSchema",
            responses: {
                200: {
                    body: "ReportingMenuResponse",
                },
                204: {},
            },
            spacebarOnly: false, // Maps to /reporting/:id
        }),
        (req: Request, res: Response) => {
            // TODO: implement
            const body = req.body as CreateReportSchema;
            if (body.name !== type)
                throw FieldErrors({
                    name: {
                        message: `Expected report type ${type} but got ${body.name}`,
                        code: "INVALID_REPORT_TYPE",
                    },
                });

            const menuPath = path.join(__dirname, "..", "..", "..", "..", "assets", "temp_report_menu_responses", `${type}.json`);
            const menuData = JSON.parse(fs.readFileSync(menuPath, "utf-8"));
            if (body.version !== menuData.version) {
                throw FieldErrors({
                    version: {
                        message: `Expected report menu version ${menuData.version} but got ${body.version}`,
                        code: "INVALID_REPORT_MENU_VERSION",
                    },
                });
            }

            if (body.variant !== menuData.variant) {
                throw FieldErrors({
                    variant: {
                        message: `Expected report menu variant ${menuData.variant} but got ${body.variant}`,
                        code: "INVALID_REPORT_MENU_VARIANT",
                    },
                });
            }

            if (body.breadcrumbs.find((_) => !(_ in menuData.nodes))) {
                console.log(menuData);
                throw FieldErrors({
                    breadcrumbs: {
                        message: `Invalid report menu breadcrumbs.`,
                        code: "INVALID_REPORT_MENU_BREADCRUMBS",
                    },
                });
            }

            const validateBreadcrumbs = (currentNode: unknown, breadcrumbs: number[]): boolean => {
                // navigate via node.children ([name, id][]) according to breadcrumbs
                let node = currentNode as { children: [string, number][] };
                for (let i = 1; i < breadcrumbs.length; i++) {
                    const crumb = breadcrumbs[i];
                    if (!node || !node.children || !Array.isArray(node.children)) return false;
                    const nextNode = node.children.find((child: [string, number]) => child[1] === crumb);
                    if (!nextNode) return false;
                    // load next node
                    const nextNodeData = menuData.nodes[crumb];
                    if (!nextNodeData) return false;
                    node = nextNodeData;
                }
                return true;
            };

            if (!validateBreadcrumbs(menuData.nodes[menuData.root_node_id], body.breadcrumbs))
                throw FieldErrors({
                    breadcrumbs: {
                        message: `Invalid report menu breadcrumbs path.`,
                        code: "INVALID_REPORT_MENU_BREADCRUMBS_PATH",
                    },
                });

            const requireFields = (obj: CreateReportSchema, fields: string[]) => {
                const missingFields: string[] = [];
                for (const field of fields) if (!(field in obj)) missingFields.push(field);

                if (missingFields.length > 0)
                    throw FieldErrors(
                        Object.fromEntries(
                            missingFields.map((f) => [
                                f,
                                {
                                    message: `Missing required field ${f}.`,
                                    code: "MISSING_FIELD",
                                },
                            ]),
                        ),
                    );
            };

            const t = Number(Object.entries(ReportMenuTypeNames).find((x) => x[1] === type)?.[0]) as ReportMenuType;
            // TODO: did i miss anything?
            switch (t) {
                case ReportMenuType.GUILD:
                case ReportMenuType.GUILD_DISCOVERY:
                    requireFields(body, ["guild_id"]);
                    break;
                case ReportMenuType.GUILD_DIRECTORY_ENTRY:
                    requireFields(body, ["guild_id", "channel_id"]);
                    break;
                case ReportMenuType.GUILD_SCHEDULED_EVENT:
                    requireFields(body, ["guild_id", "scheduled_event_id"]);
                    break;
                case ReportMenuType.MESSAGE:
                    requireFields(body, ["channel_id", "message_id"]);
                    // NOTE: is body.guild_id set if the channel is in a guild? is body.user_id ever set????
                    break;
                case ReportMenuType.STAGE_CHANNEL:
                    requireFields(body, ["channel_id", "guild_id", "stage_instance_id"]);
                    break;
                case ReportMenuType.FIRST_DM:
                    requireFields(body, ["user_id", "channel_id"]);
                    break;
                case ReportMenuType.USER:
                    requireFields(body, ["reported_user_id"]);
                    break;
                case ReportMenuType.APPLICATION:
                    requireFields(body, ["application_id"]);
                    break;
                case ReportMenuType.WIDGET:
                    requireFields(body, ["user_id", "widget_id"]);
                    break;
                default:
                    throw new HTTPError("Unknown report menu type", 400);
            }

            throw new HTTPError("Validation success - implementation TODO", 418);
        },
    );
    console.log(`[Server] Route /reporting/${type} registered (reports).`);
}
export default router;
