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
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        permission: "MANAGE_MESSAGES",
        responses: {
            200: {
                body: "Message",
            },
        },
    }),
    (req: Request, res: Response) => {
        // TODO:
        res.json({
            id: "",
            type: 0,
            content: "",
            channel_id: "",
            author: {
                id: "",
                username: "",
                avatar: "",
                discriminator: "",
				global_name: "",
                public_flags: 64,
            },
            attachments: [],
            embeds: [],
            mentions: [],
            mention_roles: [],
            pinned: false,
            mention_everyone: false,
            tts: false,
            timestamp: "",
            edited_timestamp: null,
            flags: 1,
            components: [],
            poll: {},
        }).status(200);
    },
);

export default router;
