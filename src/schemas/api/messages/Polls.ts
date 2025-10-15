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

import { PartialEmoji } from "@spacebar/schemas"

export interface Poll {
	question: PollMedia;
	answers: PollAnswer[];
	expiry: Date;
	allow_multiselect: boolean;
	results?: PollResult;
}

export interface PollMedia {
	text?: string;
	emoji?: PartialEmoji;
}

export interface PollAnswer {
	answer_id?: string;
	poll_media: PollMedia;
}

export interface PollResult {
	is_finalized: boolean;
	answer_counts: PollAnswerCount[];
}

export interface PollAnswerCount {
	id: string;
	count: number;
	me_voted: boolean;
}
