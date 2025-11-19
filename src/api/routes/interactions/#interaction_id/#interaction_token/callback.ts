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

import { ButtonStyle, InteractionCallbackSchema, InteractionCallbackType, MessageComponentType, MessageCreateSchema, MessageType } from "@spacebar/schemas";
import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { emitEvent, FieldErrors, InteractionSuccessEvent, Message, MessageCreateEvent, pendingInteractions, User } from "@spacebar/util";
import { sendMessage } from "../../../../util/handlers/Message";

const router = Router({ mergeParams: true });

router.post("/", route({}), async (req: Request, res: Response) => {
	const body = req.body as InteractionCallbackSchema;

	const errors: Record<string, { code?: string; message: string }> = {};
	const knownComponentIds: string[] = [];

	for (const row of body.data.components || []) {
		if (!row.components) {
			continue;
		}

		if (row.components.length < 1 || row.components.length > 5) {
			errors[`data.components[${body.data.components!.indexOf(row)}].components`] = {
				code: "BASE_TYPE_BAD_LENGTH",
				message: `Must be between 1 and 5 in length.`,
			};
		}

		for (const component of row.components) {
			if (component.type == MessageComponentType.Button && component.style != ButtonStyle.Link) {
				if (component.custom_id?.trim() === "") {
					errors[`data.components[${body.data.components!.indexOf(row)}].components[${row.components.indexOf(component)}].custom_id`] = {
						code: "BUTTON_COMPONENT_CUSTOM_ID_REQUIRED",
						message: "A custom id required",
					};
				}

				if (knownComponentIds.includes(component.custom_id!)) {
					errors[`data.components[${body.data.components!.indexOf(row)}].components[${row.components.indexOf(component)}].custom_id`] = {
						code: "COMPONENT_CUSTOM_ID_DUPLICATED",
						message: "Component custom id cannot be duplicated",
					};
				} else {
					knownComponentIds.push(component.custom_id!);
				}
			}
		}
	}

	if (Object.keys(errors).length > 0) {
		throw FieldErrors(errors);
	}

	const interactionId = req.params.interaction_id;
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
