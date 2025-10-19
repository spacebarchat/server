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

import { randomBytes } from "crypto";
import { InteractionSchema } from "@spacebar/schemas";
import { route } from "@spacebar/api";
import { Request, Response, Router } from "express";
import { Config, emitEvent, getPermission, Guild, InteractionCreateEvent, InteractionFailureEvent, InteractionType, Member, Message, Snowflake, User } from "@spacebar/util";
import { pendingInteractions } from "@spacebar/util/imports/Interactions";
import { InteractionCreateSchema } from "@spacebar/schemas/api/bots/InteractionCreateSchema";

const router = Router({ mergeParams: true });

router.post("/", route({}), async (req: Request, res: Response) => {
	const body = req.body as InteractionSchema;

	const interactionId = Snowflake.generate();
	const interactionToken = randomBytes(24).toString("base64url");

	emitEvent({
		event: "INTERACTION_CREATE",
		user_id: req.user_id,
		data: {
			id: interactionId,
			nonce: body.nonce,
		},
	} as InteractionCreateEvent);

	const user = await User.findOneOrFail({ where: { id: req.user_id } });

	const interactionData: Partial<InteractionCreateSchema> = {
		id: interactionId,
		application_id: body.application_id,
		channel_id: body.channel_id,
		type: body.type,
		token: interactionToken,
		version: 1,
		entitlements: [],
		authorizing_integration_owners: { "0": req.user_id },
		attachment_size_limit: Config.get().cdn.maxAttachmentSize,
	};

	if (body.type === InteractionType.ApplicationCommand || body.data.type === InteractionType.MessageComponent || body.data.type === InteractionType.ModalSubmit) {
		interactionData.data = body.data;
	}

	if (body.type != InteractionType.Ping) {
		interactionData.locale = user?.settings?.locale;
	}

	if (body.guild_id) {
		interactionData.context = 0;
		interactionData.guild_id = body.guild_id;
		interactionData.app_permissions = (await getPermission(body.application_id, body.guild_id, body.channel_id)).bitfield.toString();

		const guild = await Guild.findOneOrFail({ where: { id: body.guild_id } });
		const member = await Member.findOneOrFail({ where: { guild_id: body.guild_id, id: req.user_id }, relations: ["user"] });

		interactionData.guild = {
			id: guild.id,
			features: guild.features,
			locale: guild.preferred_locale!,
		};

		interactionData.guild_locale = guild.preferred_locale;
		interactionData.member = member.toPublicMember();
	} else {
		interactionData.user = user.toPublicUser();
		interactionData.app_permissions = (await getPermission(body.application_id, "", body.channel_id)).bitfield.toString();

		if (body.channel_id === body.application_id) {
			interactionData.context = 1;
		} else {
			interactionData.context = 2;
		}
	}

	if (body.type === InteractionType.MessageComponent || body.data.type === InteractionType.ModalSubmit) {
		interactionData.message = await Message.findOneOrFail({ where: { id: body.message_id } });
	}

	emitEvent({
		event: "INTERACTION_CREATE",
		user_id: body.application_id,
		data: interactionData,
	} as InteractionCreateEvent);

	const interactionTimeout = setTimeout(() => {
		emitEvent({
			event: "INTERACTION_FAILURE",
			user_id: req.user_id,
			data: {
				id: interactionId,
				nonce: body.nonce,
				reason_code: 2, // when types are done: InteractionFailureReason.TIMEOUT,
			},
		} as InteractionFailureEvent);
	}, 3000);

	pendingInteractions.set(interactionId, {
		timeout: interactionTimeout,
		nonce: body.nonce,
		applicationId: body.application_id,
		userId: req.user_id,
		guildId: body.guild_id,
		channelId: body.channel_id,
		type: body.type,
		commandType: body.data.type,
		commandName: body.data.name,
	});

	res.sendStatus(204);
});

export default router;
