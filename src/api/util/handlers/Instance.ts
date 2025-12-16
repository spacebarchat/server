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

import { Session } from "@spacebar/util";
import { Like } from "typeorm";

export async function initInstance() {
	// TODO: clean up database and delete tombstone data
	// TODO: set first user as instance administrator/or generate one if none exists and output it in the terminal

	// create default guild and add it to auto join
	// TODO: check if any current user is not part of autoJoinGuilds
	// const { autoJoin } = Config.get().guild;

	// if (autoJoin.enabled && !autoJoin.guilds?.length) {
	// 	const guild = await Guild.findOne({ where: {}, select: ["id"] });
	// 	if (guild) {
	// 		await Config.set({ guild: { autoJoin: { guilds: [guild.id] } } });
	// 	}
	// }

	// TODO: do no clear sessions for instance cluster
	// await Session.clear(); // This is now used as part of authentication...
	await Session.delete({ session_id: Like("TEMP_%") }); // ...but we can still clear out temporary sessions
}
