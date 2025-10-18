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
import { emitEvent, InteractionCreateEvent, InteractionFailureEvent, Snowflake } from "@spacebar/util";
import { pendingInteractions } from "../../../util/imports/Interactions";

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

	emitEvent({
		event: "INTERACTION_CREATE",
		user_id: body.application_id,
		data: {
			channel_id: body.channel_id,
			guild_id: body.guild_id,
			id: interactionId,
			member_id: req.user_id,
			token: interactionToken,
			type: body.type,
			nonce: body.nonce,
		},
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
