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
import { Config, getRights } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "Object",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const general = Config.get();
		let outputtedConfig;
		if (req.user_id) {
			const rights = await getRights(req.user_id);
			if (rights.has("OPERATOR")) outputtedConfig = general;
		} else {
			outputtedConfig = {
				limits_user_maxGuilds: general.limits.user.maxGuilds,
				limits_user_maxBio: general.limits.user.maxBio,
				limits_guild_maxEmojis: general.limits.guild.maxEmojis,
				limits_guild_maxRoles: general.limits.guild.maxRoles,
				limits_message_maxCharacters:
					general.limits.message.maxCharacters,
				limits_message_maxAttachmentSize:
					general.limits.message.maxAttachmentSize,
				limits_message_maxEmbedDownloadSize:
					general.limits.message.maxEmbedDownloadSize,
				limits_channel_maxWebhooks: general.limits.channel.maxWebhooks,
				register_dateOfBirth_requiredc:
					general.register.dateOfBirth.required,
				register_password_required: general.register.password.required,
				register_disabled: general.register.disabled,
				register_requireInvite: general.register.requireInvite,
				register_allowNewRegistration:
					general.register.allowNewRegistration,
				register_allowMultipleAccounts:
					general.register.allowMultipleAccounts,
				guild_autoJoin_canLeave: general.guild.autoJoin.canLeave,
				guild_autoJoin_guilds_x: general.guild.autoJoin.guilds,
				register_email_required: general.register.email.required,
				can_recover_account:
					general.email.provider != null &&
					general.general.frontPage != null,
			};
		}
		res.send(outputtedConfig);
	},
);

export default router;
