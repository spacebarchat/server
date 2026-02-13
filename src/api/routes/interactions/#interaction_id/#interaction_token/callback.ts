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

import { ButtonStyle, InteractionCallbackSchema, InteractionCallbackType, MessageComponentType, MessageType } from "@spacebar/schemas";
import { route } from "@spacebar/api";
import { MessageCreateAttachment, MessageCreateCloudAttachment } from "@spacebar/schemas";
import { Request, Response, Router } from "express";
import { emitEvent, FieldErrors, InteractionSuccessEvent, uploadFile, Attachment, pendingInteractions, User } from "@spacebar/util";
import { sendMessage } from "../../../../util/handlers/Message";

const router = Router({ mergeParams: true });

router.post("/", route({}), async (req: Request, res: Response) => {
    const body = req.body as InteractionCallbackSchema;

    const interactionId = req.params.interaction_id as string;
    const interaction = pendingInteractions.get(req.params.interaction_id);

    if (!interaction) {
        return;
    }

    clearTimeout(interaction.timeout);

    emitEvent({
        event: "INTERACTION_SUCCESS",
        user_id: interaction?.userId,
        data: {
            id: interactionId,
            nonce: interaction?.nonce,
        },
    } as InteractionSuccessEvent);

    switch (body.type) {
        case InteractionCallbackType.PONG:
            // TODO
            break;
        case InteractionCallbackType.ACKNOWLEDGE:
            // Deprected
            break;
        case InteractionCallbackType.CHANNEL_MESSAGE:
            // TODO
            break;
        case InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE: {
            const user = await User.findOneOrFail({ where: { id: interaction.userId } });
            /*
			const files = (req.files as Express.Multer.File[]) ?? [];
			//I don't think traditional attachments are allowed anyways
			const attachments: (Attachment | MessageCreateAttachment | MessageCreateCloudAttachment)[] = [];
			for (const currFile of files) {
				try {
					const file = await uploadFile(`/attachments/${interaction.channelId}`, currFile);
					attachments.push(Attachment.create({ ...file, proxy_url: file.url }));
				} catch (error) {
					return res.status(400).json({ message: error?.toString() });
				}
			}
			*/
            await sendMessage({
                type: MessageType.APPLICATION_COMMAND,
                timestamp: new Date(),
                application_id: interaction.applicationId,
                channel_id: interaction.channelId,
                author_id: interaction.applicationId,
                nonce: interaction.nonce,
                content: body.data.content,
                components: body.data.components || [],
                tts: body.data.tts,
                embeds: body.data.embeds || [],
                attachments: body.data.attachments,
                poll: body.data.poll,
                flags: body.data.flags,
                reactions: [],
                // webhook_id: interaction.applicationId, // This one requires a webhook to be created first
                interaction: {
                    id: interactionId,
                    name: interaction.commandName,
                    type: 2,
                    user,
                },
                interaction_metadata: {
                    id: interactionId,
                    type: 2,
                    user_id: interaction.userId,
                    user,
                    authorizing_integration_owners: {
                        "1": interaction.userId,
                    },
                    name: interaction.commandName,
                    command_type: interaction.commandType,
                },
            });

            break;
        }
        case InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE:
            // TODO
            break;
        case InteractionCallbackType.DEFERRED_UPDATE_MESSAGE:
            // TODO
            break;
        case InteractionCallbackType.UPDATE_MESSAGE:
            // TODO
            break;
        case InteractionCallbackType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT:
            // TODO
            break;
        case InteractionCallbackType.MODAL:
            // TODO
            break;
        case InteractionCallbackType.PREMIUM_REQUIRED:
            // Deprecated
            break;
        case InteractionCallbackType.IFRAME_MODAL:
            // TODO
            break;
        case InteractionCallbackType.LAUNCH_ACTIVITY:
            // TODO
            break;
    }

    pendingInteractions.delete(interactionId);
    res.sendStatus(204);
});

export default router;
