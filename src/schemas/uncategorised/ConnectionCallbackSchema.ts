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

import { z } from "zod";

export const ConnectionCallbackSchema = z
	.object({
		code: z.string(),
		state: z.string(),
		insecure: z.boolean(),
		friend_sync: z.boolean(),
		openid_params: z.record(z.string(), z.any()),
	})
	.partial({
		code: true,
		openid_params: true,
	});

export type ConnectionCallbackSchema = z.infer<typeof ConnectionCallbackSchema>;
