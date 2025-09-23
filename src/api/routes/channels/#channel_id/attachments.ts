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

import { generateCode, randomString, route } from "@spacebar/api";
import {
	Attachment,
	Channel,
	Config,
	emitEvent,
	GreetRequestSchema,
	Message,
	MessageCreateEvent,
	MessageType,
	Permissions,
	Sticker,
	UploadAttachmentRequestSchema,
	UploadAttachmentResponseSchema,
	User,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { In } from "typeorm";
import { CloudAttachment } from "../../../../util/entities/CloudAttachment";

const router: Router = Router();

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

		const user = await User.findOneOrFail({ where: { id: req.user_id } });
		const channel = await Channel.findOneOrFail({ where: { id: channel_id } });

		if (!(await channel.getUserPermissions({ user_id: req.user_id })).has(Permissions.FLAGS.ATTACH_FILES)) {
			return res.status(403).json({
				code: 403,
				message: "Missing Permissions: ATTACH_FILES",
			});
		}

		const cdnUrl = Config.get().cdn.endpointPublic;
		const batchId = `CLOUD_${user.id}_${randomString(128)}`;
		const attachments = await Promise.all(
			payload.files.map(async (attachment) => {
				attachment.filename = attachment.filename.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._]+/g, "");
				const uploadFilename = `${channel_id}/${batchId}/${attachment.id}/${attachment.filename}`;
				const newAttachment = CloudAttachment.create({
					user: user,
					channel: channel,
					uploadFilename: uploadFilename,
					userAttachmentId: attachment.id,
					userFilename: attachment.filename,
					userFileSize: attachment.file_size,
					userIsClip: attachment.is_clip,
					userOriginalContentType: attachment.original_content_type,
				});
				await newAttachment.save();
				return newAttachment;
			}),
		);

		res.send({attachments: attachments.map(a => {
			return {
				id: a.userAttachmentId,
				upload_filename: a.uploadFilename,
				upload_url: `${cdnUrl}/attachments/${a.uploadFilename}`,
			}
			})} as UploadAttachmentResponseSchema);
	},
);

export default router;
