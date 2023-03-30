/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
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

import { Embed } from "@fosscord/util";

type Attachment = {
	id: string;
	filename: string;
};

export interface MessageCreateSchema {
	type?: number;
	content?: string;
	nonce?: string;
	channel_id?: string;
	tts?: boolean;
	flags?: string;
	embeds?: Embed[];
	embed?: Embed;
	// TODO: ^ embed is deprecated in favor of embeds (https://discord.com/developers/docs/resources/channel#message-object)
	allowed_mentions?: {
		parse?: string[];
		roles?: string[];
		users?: string[];
		replied_user?: boolean;
	};
	message_reference?: {
		message_id: string;
		channel_id: string;
		guild_id?: string;
		fail_if_not_exists?: boolean;
	};
	payload_json?: string;
	file?: { filename: string };
	/**
	TODO: we should create an interface for attachments
	TODO: OpenWAAO<-->attachment-style metadata conversion
	**/
	attachments?: Attachment[];
	sticker_ids?: string[];
}
