/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { Request, Response, Router } from "express";
import { route } from "@spacebar/api/util/handlers/route";
import { Emoji, Application } from "@spacebar/database";
import { Config, DiscordApiErrors, Snowflake, handleFile } from "@spacebar/util";
import { ApplicationEmojiModifySchema, EmojiCreateSchema } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "ApplicationsEmojisResponse",
            },
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { application_id } = req.params as { [key: string]: string };

        // TODO: is there *any* gating on this endpoint?

        const emojis = await Emoji.find({
            where: { application_id: application_id },
            relations: { user: true },
        });

        return res.json({ items: emojis });
    },
);

router.get(
    "/:emoji_id",
    route({
        responses: {
            200: {
                body: "Emoji",
            },
            403: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { application_id, emoji_id } = req.params as { [key: string]: string };

        const emoji = await Emoji.findOneOrFail({
            where: { application_id: application_id, id: emoji_id },
            relations: { user: true },
        });

        return res.json(emoji);
    },
);

router.post(
    "/",
    route({
        requestBody: "EmojiCreateSchema",
        responses: {
            201: {
                body: "Emoji",
            },
            403: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { application_id } = req.params as { [key: string]: string };
        const body = req.body as EmojiCreateSchema;

        const app = await Application.findOne({ where: { id: application_id } });
        if (!app) throw DiscordApiErrors.UNKNOWN_APPLICATION;
        if (req.user_id != app?.id && req.user_id != app?.owner_id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

        const id = Snowflake.generate();
        const emoji_count = await Emoji.count({
            where: { application_id: application_id },
        });
        const { maxEmojis } = Config.get().limits.application;

        if (emoji_count >= maxEmojis) throw DiscordApiErrors.MAXIMUM_NUMBER_OF_EMOJIS_REACHED.withParams(maxEmojis);
        if (body.require_colons == null) body.require_colons = true;
        if (body.name?.includes("-")) body.name = body.name?.replaceAll("-", ""); // Dashes are invalid apparently

        const user = req.user;
        await handleFile(`/emojis/${id}`, body.image);

        const mimeType = body.image.split(":")[1].split(";")[0];
        const emoji = await Emoji.create({
            id: id,
            application_id: application_id,
            name: body.name,
            require_colons: body.require_colons ?? undefined, // schema allows nulls, db does not
            user: user,
            managed: false,
            animated: mimeType == "image/gif" || mimeType == "image/apng" || mimeType == "video/webm",
            available: true,
            roles: [],
        }).save();

        return res.status(201).json(emoji);
    },
);

router.patch(
    "/:emoji_id",
    route({
        requestBody: "ApplicationEmojiModifySchema",
        responses: {
            200: {
                body: "Emoji",
            },
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { emoji_id, application_id } = req.params as { [key: string]: string };
        const body = req.body as ApplicationEmojiModifySchema;

        const app = await Application.findOne({ where: { id: application_id } });
        if (!app) throw DiscordApiErrors.UNKNOWN_APPLICATION;
        if (req.user_id != app?.id && req.user_id != app?.owner_id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

        if (body.name?.includes("-")) body.name = body.name?.replaceAll("-", ""); // Dashes are invalid apparently

        await Emoji.findOneOrFail({
            where: { id: emoji_id, application_id: application_id },
        });

        const emoji = await Emoji.create({
            ...body,
            id: emoji_id,
            application_id: application_id,
        }).save();

        return res.json(emoji);
    },
);

router.delete(
    "/:emoji_id",
    route({
        responses: {
            204: {},
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { emoji_id, application_id } = req.params as { [key: string]: string };

        const app = await Application.findOne({ where: { id: application_id } });
        if (!app) throw DiscordApiErrors.UNKNOWN_APPLICATION;
        if (req.user_id != app?.id && req.user_id != app?.owner_id) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

        await Emoji.delete({
            id: emoji_id,
            application_id: application_id,
        });

        res.sendStatus(204);
    },
);

export default router;
