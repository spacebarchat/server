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
import { Note, Snowflake, User, emitEvent } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router: Router = Router({ mergeParams: true });

router.get(
	"/:user_id",
	route({
		responses: {
			200: {
				body: "UserNoteResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { user_id } = req.params;

		const note = await Note.findOneOrFail({
			where: {
				owner: { id: req.user_id },
				target: { id: user_id },
			},
		});

		return res.json({
			note: note?.content,
			note_user_id: user_id,
			user_id: req.user_id,
		});
	},
);

router.put(
	"/:user_id",
	route({
		requestBody: "UserNoteUpdateSchema",
		responses: {
			204: {},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { user_id } = req.params;
		const owner = await User.findOneOrFail({ where: { id: req.user_id } });
		const target = await User.findOneOrFail({ where: { id: user_id } }); //if noted user does not exist throw
		const { note } = req.body;

		if (note && note.length) {
			// upsert a note
			if (
				await Note.findOne({
					where: {
						owner: { id: owner.id },
						target: { id: target.id },
					},
				})
			) {
				Note.update(
					{ owner: { id: owner.id }, target: { id: target.id } },
					{ owner, target, content: note },
				);
			} else {
				Note.insert({
					id: Snowflake.generate(),
					owner,
					target,
					content: note,
				});
			}
		} else {
			await Note.delete({
				owner: { id: owner.id },
				target: { id: target.id },
			});
		}

		await emitEvent({
			event: "USER_NOTE_UPDATE",
			data: {
				note: note,
				id: target.id,
			},
			user_id: owner.id,
		});

		return res.sendStatus(204);
	},
);

export default router;
