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

import { Session, TimeSpan } from "@spacebar/util";
import { Like } from "typeorm";
import { setInterval } from "timers";

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
	// ... but we can still expire temporary sessions for legacy tokens
	setInterval(
		async () => {
			for await (const session of await Session.createQueryBuilder("session").where("last_seen = '1970/01/01'").select().stream()) {
				// session object has all fields prefixed with `session_`... thanks typeorm
				if (TimeSpan.fromDates((session.session_created_at as Date).getTime(), new Date().getTime()).totalHours > 1) {
					console.log(`[API/Instance.ts] Deleting temporary session ${session.session_session_id} created at ${session.session_created_at}`);
					await Session.delete({ session_id: session.session_session_id });
				}
			}
		},
		1000 * 60 * 30,
	);
	// await Session.delete({ session_id: Like("TEMP_%") });
}
