/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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

import { route } from "@fosscord/api";
import {
	Channel,
	ChannelType,
	DiscordApiErrors,
	emitEvent,
	getPermission,
	VoiceState,
	VoiceStateUpdateEvent,
	VoiceStateUpdateSchema,
} from "@fosscord/util";
import { Request, Response, Router } from "express";

const router = Router();
//TODO need more testing when community guild and voice stage channel are working

router.patch(
	"/",
	route({
		requestBody: "VoiceStateUpdateSchema",
		responses: {
			204: {},
			400: {
				body: "APIErrorResponse",
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
		const body = req.body as VoiceStateUpdateSchema;
		const { guild_id } = req.params;
		const user_id =
			req.params.user_id === "@me" ? req.user_id : req.params.user_id;

		const perms = await getPermission(
			req.user_id,
			guild_id,
			body.channel_id,
		);

		/*
	From https://discord.com/developers/docs/resources/guild#modify-current-user-voice-state
	You must have the MUTE_MEMBERS permission to unsuppress others. You can always suppress yourself.
	You must have the REQUEST_TO_SPEAK permission to request to speak. You can always clear your own request to speak.
	 */
		if (body.suppress && user_id !== req.user_id) {
			perms.hasThrow("MUTE_MEMBERS");
		}
		if (!body.suppress) body.request_to_speak_timestamp = new Date();
		if (body.request_to_speak_timestamp) perms.hasThrow("REQUEST_TO_SPEAK");

		const voice_state = await VoiceState.findOne({
			where: {
				guild_id,
				channel_id: body.channel_id,
				user_id,
			},
		});
		if (!voice_state) throw DiscordApiErrors.UNKNOWN_VOICE_STATE;

		voice_state.assign(body);
		const channel = await Channel.findOneOrFail({
			where: { guild_id, id: body.channel_id },
		});
		if (channel.type !== ChannelType.GUILD_STAGE_VOICE) {
			throw DiscordApiErrors.CANNOT_EXECUTE_ON_THIS_CHANNEL_TYPE;
		}

		await Promise.all([
			voice_state.save(),
			emitEvent({
				event: "VOICE_STATE_UPDATE",
				data: voice_state,
				guild_id,
			} as VoiceStateUpdateEvent),
		]);
		return res.sendStatus(204);
	},
);

export default router;
