/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTIBILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { route } from "@spacebar/api";
import { Config } from "@spacebar/util";
import { MessageEditSchema } from "@spacebar/schemas";
import { Request, Response, Router } from "express";
import multer from "multer";
import { deleteWebhookMessage, editWebhookMessage, getWebhookForToken, getWebhookMessage } from "../../../../../../util/handlers/WebhookMessage";

const router = Router({ mergeParams: true });

const messageUpload = multer({
    limits: {
        fileSize: Config.get().limits.message.maxAttachmentSize,
        fields: 10,
    },
    storage: multer.memoryStorage(),
});

function getThreadId(req: Request) {
    return typeof req.query.thread_id === "string" ? req.query.thread_id : undefined;
}

router.get(
    "/",
    route({
        responses: {
            200: {
                body: "Message",
            },
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { webhook_id, token, message_id } = req.params as { [key: string]: string };

        await getWebhookForToken(webhook_id, token);
        const message = await getWebhookMessage(webhook_id, message_id, getThreadId(req));

        return res.json(message.toJSON());
    },
);

router.patch(
    "/",
    messageUpload.any(),
    (req, _res, next) => {
        if (req.body.payload_json) {
            req.body = JSON.parse(req.body.payload_json);
        }

        next();
    },
    route({
        requestBody: "MessageEditSchema",
        stripNulls: true,
        query: {
            thread_id: {
                type: "string",
                required: false,
                description: "Edit a webhook message in the specified thread.",
            },
        },
        responses: {
            200: {
                body: "Message",
            },
            400: {
                body: "APIErrorResponse",
            },
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { webhook_id, token, message_id } = req.params as { [key: string]: string };
        const body = req.body as MessageEditSchema;

        await getWebhookForToken(webhook_id, token);
        const message = await getWebhookMessage(webhook_id, message_id, getThreadId(req));
        const updated = await editWebhookMessage(message, body);

        return res.json(updated.toJSON());
    },
);

router.delete(
    "/",
    route({
        query: {
            thread_id: {
                type: "string",
                required: false,
                description: "Delete a webhook message in the specified thread.",
            },
        },
        responses: {
            204: {},
            404: {},
        },
    }),
    async (req: Request, res: Response) => {
        const { webhook_id, token, message_id } = req.params as { [key: string]: string };

        await getWebhookForToken(webhook_id, token);
        const message = await getWebhookMessage(webhook_id, message_id, getThreadId(req));
        await deleteWebhookMessage(message);

        return res.sendStatus(204);
    },
);

export default router;
