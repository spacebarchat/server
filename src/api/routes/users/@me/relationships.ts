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
import {
	Config,
	DiscordApiErrors,
	Relationship,
	RelationshipAddEvent,
	RelationshipRemoveEvent,
	User,
	emitEvent,
} from "@spacebar/util";
import { Request, Response, Router } from "express";
import { HTTPError } from "lambert-server";
import { PublicUserProjection, RelationshipType } from "@spacebar/schemas";

const router = Router({ mergeParams: true });

const userProjection: (keyof User)[] = [
	"relationships",
	...PublicUserProjection,
];

router.get(
	"/",
	route({
		responses: {
			200: {
				body: "UserRelationshipsResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			relations: ["relationships", "relationships.to"],
			select: ["id", "relationships"],
		});

		//TODO DTO
		const related_users = user.relationships.map((r) => {
			return {
				id: r.to.id,
				type: r.type,
				nickname: null,
				user: r.to.toPublicUser(),
			};
		});

		return res.json(related_users);
	},
);

router.put(
	"/:user_id",
	route({
		requestBody: "RelationshipPutSchema",
		responses: {
			204: {},
			"4XX": {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		return await updateRelationship(
			req,
			res,
			await User.findOneOrFail({
				where: { id: req.params.user_id },
				relations: ["relationships", "relationships.to"],
				select: userProjection,
			}),
			req.body.type ?? RelationshipType.friends,
		);
	},
);

router.post(
	"/",
	route({
		requestBody: "RelationshipPostSchema",
		responses: {
			204: {},
			"4XX": {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		return await updateRelationship(
			req,
			res,
			await User.findOneOrFail({
				relations: ["relationships", "relationships.to"],
				select: userProjection,
				where: {
					discriminator: String(req.body.discriminator).padStart(
						4,
						"0",
					), //Discord send the discriminator as integer, we need to add leading zeroes
					username: req.body.username,
				},
			}),
			req.body.type,
		);
	},
);

router.delete(
	"/:user_id",
	route({
		responses: {
			204: {},
			"4XX": {
				body: "APIErrorResponse",
			},
			404: {
				body: "APIErrorResponse",
			},
		},
	}),
	async (req: Request, res: Response) => {
		const { id } = req.params;
		if (id === req.user_id)
			throw new HTTPError("You can't remove yourself as a friend");

		const user = await User.findOneOrFail({
			where: { id: req.user_id },
			select: userProjection,
			relations: ["relationships"],
		});
		const friend = await User.findOneOrFail({
			where: { id: id },
			select: userProjection,
			relations: ["relationships"],
		});

		const relationship = user.relationships.find((x) => x.to_id === id);
		const friendRequest = friend.relationships.find(
			(x) => x.to_id === req.user_id,
		);

		if (!relationship)
			throw new HTTPError("You are not friends with the user", 404);
		if (relationship?.type === RelationshipType.blocked) {
			// unblock user

			await Promise.all([
				Relationship.delete({ id: relationship.id }),
				emitEvent({
					event: "RELATIONSHIP_REMOVE",
					user_id: req.user_id,
					data: relationship.toPublicRelationship(),
				} as RelationshipRemoveEvent),
			]);
			return res.sendStatus(204);
		}
		if (friendRequest && friendRequest.type !== RelationshipType.blocked) {
			await Promise.all([
				Relationship.delete({ id: friendRequest.id }),
				await emitEvent({
					event: "RELATIONSHIP_REMOVE",
					data: friendRequest.toPublicRelationship(),
					user_id: id,
				} as RelationshipRemoveEvent),
			]);
		}

		await Promise.all([
			Relationship.delete({ id: relationship.id }),
			emitEvent({
				event: "RELATIONSHIP_REMOVE",
				data: relationship.toPublicRelationship(),
				user_id: req.user_id,
			} as RelationshipRemoveEvent),
		]);

		return res.sendStatus(204);
	},
);

export default router;

async function updateRelationship(
	req: Request,
	res: Response,
	friend: User,
	type: RelationshipType,
) {
	const id = friend.id;
	if (id === req.user_id)
		throw new HTTPError("You can't add yourself as a friend");

	const user = await User.findOneOrFail({
		where: { id: req.user_id },
		relations: ["relationships", "relationships.to"],
		select: userProjection,
	});

	let relationship = user.relationships.find((x) => x.to_id === id);
	const friendRequest = friend.relationships.find(
		(x) => x.to_id === req.user_id,
	);

	// TODO: you can add infinitely many blocked users (should this be prevented?)
	if (type === RelationshipType.blocked) {
		if (relationship) {
			if (relationship.type === RelationshipType.blocked)
				throw new HTTPError("You already blocked the user");
			relationship.type = RelationshipType.blocked;
			await relationship.save();
		} else {
			relationship = await Relationship.create({
				to_id: id,
				type: RelationshipType.blocked,
				from_id: req.user_id,
			}).save();
		}

		if (friendRequest && friendRequest.type !== RelationshipType.blocked) {
			await Promise.all([
				Relationship.delete({ id: friendRequest.id }),
				emitEvent({
					event: "RELATIONSHIP_REMOVE",
					data: friendRequest.toPublicRelationship(),
					user_id: id,
				} as RelationshipRemoveEvent),
			]);
		}

		await emitEvent({
			event: "RELATIONSHIP_ADD",
			data: relationship.toPublicRelationship(),
			user_id: req.user_id,
		} as RelationshipAddEvent);

		return res.sendStatus(204);
	}

	const { maxFriends } = Config.get().limits.user;
	if (user.relationships.length >= maxFriends)
		throw DiscordApiErrors.MAXIMUM_FRIENDS.withParams(maxFriends);

	let incoming_relationship = Relationship.create({
		nickname: undefined,
		type: RelationshipType.incoming,
		to: user,
		from: friend,
	});
	let outgoing_relationship = Relationship.create({
		nickname: undefined,
		type: RelationshipType.outgoing,
		to: friend,
		from: user,
	});

	if (friendRequest) {
		if (friendRequest.type === RelationshipType.blocked)
			throw new HTTPError("The user blocked you");
		if (friendRequest.type === RelationshipType.friends)
			throw new HTTPError("You are already friends with the user");
		// accept friend request
		incoming_relationship = friendRequest;
		incoming_relationship.type = RelationshipType.friends;
	}

	if (relationship) {
		if (relationship.type === RelationshipType.outgoing)
			throw new HTTPError("You already sent a friend request");
		if (relationship.type === RelationshipType.blocked)
			throw new HTTPError(
				"Unblock the user before sending a friend request",
			);
		if (relationship.type === RelationshipType.friends)
			throw new HTTPError("You are already friends with the user");
		outgoing_relationship = relationship;
		outgoing_relationship.type = RelationshipType.friends;
	}

	await Promise.all([
		incoming_relationship.save(),
		outgoing_relationship.save(),
		emitEvent({
			event: "RELATIONSHIP_ADD",
			data: outgoing_relationship.toPublicRelationship(),
			user_id: req.user_id,
		} as RelationshipAddEvent),
		emitEvent({
			event: "RELATIONSHIP_ADD",
			data: {
				...incoming_relationship.toPublicRelationship(),
				should_notify: true,
			},
			user_id: id,
		} as RelationshipAddEvent),
	]);

	return res.sendStatus(204);
}
