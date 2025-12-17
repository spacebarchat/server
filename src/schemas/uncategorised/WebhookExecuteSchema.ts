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

import { Embed } from "@spacebar/schemas";
import { MessageCreateAttachment, PollCreationSchema } from "./MessageCreateSchema";

export interface WebhookExecuteSchema {
	content?: string;
	username?: string;
	avatar_url?: string;
	tts?: boolean;
	embeds?: Embed[];
	allowed_mentions?: {
		parse?: string[];
		roles?: string[];
		users?: string[];
		replied_user?: boolean;
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	components?: any[];
	file?: { filename: string };
	payload_json?: string;
	/**
	TODO: we should create an interface for attachments
	TODO: OpenWAAO<-->attachment-style metadata conversion
	**/
	attachments?: MessageCreateAttachment[];
	flags?: number;
	thread_name?: string;
	applied_tags?: string[];
	message_reference?: {
		message_id: string;
		channel_id?: string;
		guild_id?: string;
		fail_if_not_exists?: boolean;
	};
	sticker_ids?: string[];
	nonce?: string;
	enforce_nonce?: boolean; // For Discord compatibility, it's the default behavior here
	poll?: PollCreationSchema;
}
