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

import { randomString, route } from "@spacebar/api";
import { Channel, Config, Permissions, User } from "@spacebar/util";
import { Request, Response, Router } from "express";
import { CloudAttachment } from "@spacebar/util";
import { UploadAttachmentRequestSchema, UploadAttachmentResponseSchema } from "@spacebar/schemas";

const router: Router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        requestBody: "UploadAttachmentRequestSchema",
        responses: {
            200: {
                body: "UploadAttachmentResponseSchema",
            },
            404: {},
            400: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const payload = req.body as UploadAttachmentRequestSchema;
        const { channel_id } = req.params;

        const user = req.user;
        const channel = await Channel.findOneOrFail({ where: { id: channel_id } });

        if (!(await channel.getUserPermissions({ user_id: req.user_id })).has(Permissions.FLAGS.ATTACH_FILES)) {
            return res.status(403).json({
                code: 403,
                message: "Missing Permissions: ATTACH_FILES",
            });
        }

        const cdnUrl = Config.get().cdn.endpointPublic;
        const batchId = `CLOUD_${user.id}_${randomString(128)}`;

        // validate IDs
        const seenIds: (string | undefined)[] = [];
        for (const file of payload.files) {
            if (seenIds.includes(file.id)) {
                return res.status(400).json({
                    code: 400,
                    message: `Duplicate attachment ID: ${file.id}`,
                });
            }
            seenIds.push(file.id);
        }

        const attachments = await Promise.all(
            payload.files.map(async (attachment) => {
                attachment.filename = attachment.filename.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._]+/g, "");
                const uploadFilename = `${channel_id}/${batchId}/${attachment.id ?? "0"}/${attachment.filename}`;
                const newAttachment = CloudAttachment.create({
                    user: user,
                    channel: channel,
                    uploadFilename: uploadFilename,
                    userAttachmentId: attachment.id ?? "0",
                    userFilename: attachment.filename,
                    userFileSize: attachment.file_size,
                    userIsClip: attachment.is_clip,
                    userOriginalContentType: attachment.original_content_type,
                });
                await newAttachment.insert();
                return newAttachment;
            }),
        );

        res.send({
            attachments: attachments.map((a) => {
                return {
                    id: a.userAttachmentId,
                    upload_filename: a.uploadFilename,
                    upload_url: `${cdnUrl}/_spacebar/cdn/cloud-attachments/${a.uploadFilename}`,
                    original_content_type: a.userOriginalContentType,
                };
            }),
        } as UploadAttachmentResponseSchema);
    },
);

router.delete("/:cloud_attachment_url", async (req: Request, res: Response) => {
    const { channel_id, cloud_attachment_url } = req.params;

    const user = req.user;
    const channel = await Channel.findOneOrFail({ where: { id: channel_id } });
    const att = await CloudAttachment.findOneOrFail({ where: { uploadFilename: decodeURI(cloud_attachment_url) } });
    if (att.userId !== user.id) {
        return res.status(403).json({
            code: 403,
            message: "You do not own this attachment.",
        });
    }

    if (att.channelId !== channel.id) {
        return res.status(400).json({
            code: 400,
            message: "Attachment does not belong to this channel.",
        });
    }

    const response = await fetch(`${Config.get().cdn.endpointPrivate}/_spacebar/cdn/cloud-attachments/${att.uploadFilename}`, {
        headers: {
            signature: Config.get().security.requestSignature,
        },
        method: "DELETE",
    });

    await att.remove();
    return res.status(response.status).send(response.body);
});

export default router;
