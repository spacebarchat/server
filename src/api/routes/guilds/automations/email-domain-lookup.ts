/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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
import { FieldErrors } from "@spacebar/util";
import emailProviders from "email-providers/all.json";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { EmailDomainLookupResponse, EmailDomainLookupSchema, EmailDomainLookupVerifyCodeSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        requestBody: "EmailDomainLookupSchema",
        responses: {
            200: {
                body: "EmailDomainLookupResponse",
            },
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { email } = req.body as EmailDomainLookupSchema;

        const [_, tld] = email.split("@");

        if (emailProviders.includes(tld.toLowerCase())) {
            throw FieldErrors({
                name: {
                    message: "That looks like a personal email address. Please use your official student email.",
                    code: "EMAIL_IS_UNOFFICIAL",
                },
            });
        }

        return res.json({
            guilds_info: [],
            has_matching_guild: false,
        } as EmailDomainLookupResponse);
    },
);

router.post(
    "/verify-code",
    route({
        requestBody: "EmailDomainLookupVerifyCodeSchema",
        responses: {
            // 200: {
            // 	body: "EmailDomainLookupVerifyCodeResponse",
            // },
            400: {
                body: "APIErrorResponse",
            },
            501: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { email } = req.body as EmailDomainLookupVerifyCodeSchema;

        const [_, tld] = email.split("@");

        if (emailProviders.includes(tld.toLowerCase())) {
            throw FieldErrors({
                name: {
                    message: "That looks like a personal email address. Please use your official student email.",
                    code: "EMAIL_IS_UNOFFICIAL",
                },
            });
        }

        throw new HTTPError("Not implemented", 501);

        // return res.json({
        // 	guild: null,
        // 	joined: false,
        // } as EmailDomainLookupVerifyCodeResponse);
    },
);

export default router;
