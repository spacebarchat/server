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

import { MinimalPublicUserDTO } from "./UserDTO";
import { Channel, PublicUserProjection, User } from "../entities";

export class DmChannelDTO {
	icon: string | null;
	id: string;
	last_message_id: string | null;
	name: string | null;
	origin_channel_id: string | null;
	owner_id?: string;
	recipients: MinimalPublicUserDTO[];
	type: number;

	static async from(
		channel: Channel,
		excluded_recipients: string[] = [],
		origin_channel_id?: string,
	) {
		const obj = new DmChannelDTO();
		obj.icon = channel.icon || null;
		obj.id = channel.id;
		obj.last_message_id = channel.last_message_id || null;
		obj.name = channel.name || null;
		obj.origin_channel_id = origin_channel_id || null;
		obj.owner_id = channel.owner_id;
		obj.type = channel.type;
		obj.recipients = (
			await Promise.all(
				channel.recipients
					?.filter((r) => !excluded_recipients.includes(r.user_id))
					.map(async (r) => {
						return await User.findOneOrFail({
							where: { id: r.user_id },
							select: PublicUserProjection,
						});
					}) || [],
			)
		).map((u) => new MinimalPublicUserDTO(u));
		return obj;
	}

	excludedRecipients(excluded_recipients: string[]): DmChannelDTO {
		return {
			...this,
			recipients: this.recipients.filter(
				(r) => !excluded_recipients.includes(r.id),
			),
		};
	}
}
