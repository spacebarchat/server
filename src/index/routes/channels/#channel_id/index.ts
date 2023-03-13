/*
 * Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
 * Copyright (C) 2023 Fosscord and Fosscord Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Channel, Message, User } from "@fosscord/util";
import { Request, Response, Router } from "express";
import { route } from "@fosscord/api";

const router: Router = Router();
// TODO: delete channel
// TODO: Get channel

router.get("/", route({}), async (req: Request, res: Response) => {
	const { channel_id } = req.params;
	const chunk_size = Number(req.query.chunk_size) || 100;
	if (chunk_size > 1000)
		return res
			.status(400)
			.send({ message: "chunk_size must be <= 1000", code: 50035 });

	// Alicia - get channel
	const channel = await Channel.findOne({
		where: { id: channel_id },
		relations: ["guild"],
	});
	// Alicia - if channel not found, or not indexable...
	if (!channel || !channel.indexable)
		return res.status(404).send({
			message: "Unknown Channel (Is it indexable?)",
			code: 10003,
		});

	res.setHeader("Transfer-Encoding", "chunked");
	// Alicia - base body...
	res.write("context and info here...\n");

	// Alicia - get messages
	console.time("get channel");
	console.log("Creating query builders...");
	const messageQueryBuilder = await Message.createQueryBuilder();
	const userQueryBuilder = await User.createQueryBuilder();
	console.log(`Querying messages for channel ${channel_id}...`);
	const msg_author_ids = await messageQueryBuilder
		.where("channel_id = :channel_id", { channel_id })
		.orderBy("id::int8", "DESC")
		.select("Message.id, Message.author_id")
		.getRawMany();

	const message_ids = msg_author_ids.map((message) => message.id);
	const author_ids = msg_author_ids.map((message) => message.author_id);

	console.log(
		`Got ${message_ids.length} messages for channel ${channel_id}...`,
	);
	// Alicia - get authors
	const author_results = await userQueryBuilder
		.where("id IN (:...ids)", {
			ids: author_ids.unique(),
		})
		.distinctOn(["id"])
		.select("User.id, User.username, User.discriminator, User.avatar")
		.getRawMany();
	// Alicia - turn result into dictionary
	const authors: any = {};
	for (const author of author_results) {
		authors[author.User_id] = author;
	}

	console.log(
		`Got ${author_results.length} authors for channel ${channel_id}...`,
	);

	// Alicia - write messages
	while (message_ids.length > 0) {
		const current_message_ids = message_ids.splice(0, chunk_size);
		res.write(`<!-- ${message_ids.length} remain... -->\n`);
		console.log(`${message_ids.length} remain...`);
		const messages = await messageQueryBuilder
			.select("*")
			.where("id IN (:...ids)", {
				ids: current_message_ids,
			})
			.getRawMany();
		for (const message of messages) {
			res.write(JSON.stringify(message) + "\n");
		}
	}
	// message_ids.slice();
	// for (const message_id of message_ids) {
	// 	const message = await Message.findOne({
	// 		where: { id: message_id + "" },
	// 	});
	// 	res.write(JSON.stringify(message) + "\n");
	// 	res.write("\n");
	// }

	res.write(JSON.stringify(channel));
	console.timeEnd("get channel");
	res.end();
});

export default router;
