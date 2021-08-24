import {
	RelationshipAddEvent,
	User,
	PublicUserProjection,
	toObject,
	RelationshipType,
	RelationshipRemoveEvent,
	UserDocument,
	emitEvent
} from "@fosscord/util";
import { Router, Response, Request } from "express";
import { HTTPError } from "lambert-server";

import { check, Length } from "../../../util/instanceOf";

const router = Router();

const userProjection = { "user_data.relationships": true, ...PublicUserProjection };

router.get("/", async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({ id: req.user_id }, { user_data: { relationships: true } }).populate({
		path: "user_data.relationships.id",
		model: User
	});
	return res.json(user.user_data.relationships);
});

async function addRelationship(req: Request, res: Response, friend: UserDocument, type: RelationshipType) {
	const id = friend.id;
	if (id === req.user_id) throw new HTTPError("You can't add yourself as a friend");

	const user = await User.findOneOrFail({ id: req.user_id }, userProjection);
	const newUserRelationships = [...user.user_data.relationships];
	const newFriendRelationships = [...friend.user_data.relationships];

	var relationship = newUserRelationships.find((x) => x.id === id);
	const friendRequest = newFriendRelationships.find((x) => x.id === req.user_id);

	if (type === RelationshipType.blocked) {
		if (relationship) {
			if (relationship.type === RelationshipType.blocked) throw new HTTPError("You already blocked the user");
			relationship.type = RelationshipType.blocked;
		} else {
			relationship = { id, type: RelationshipType.blocked };
			newUserRelationships.push(relationship);
		}

		if (friendRequest && friendRequest.type !== RelationshipType.blocked) {
			newFriendRelationships.remove(friendRequest);
			await Promise.all([
				User.update({ id: friend.id }, { "user_data.relationships": newFriendRelationships }),
				emitEvent({
					event: "RELATIONSHIP_REMOVE",
					data: friendRequest,
					user_id: id
				} as RelationshipRemoveEvent)
			]);
		}

		await Promise.all([
			User.update({ id: req.user_id }, { "user_data.relationships": newUserRelationships }),
			emitEvent({
				event: "RELATIONSHIP_ADD",
				data: {
					...relationship,
					user: { ...friend, user_data: undefined }
				},
				user_id: req.user_id
			} as RelationshipAddEvent)
		]);

		return res.sendStatus(204);
	}

	var incoming_relationship = { id: req.user_id, nickname: undefined, type: RelationshipType.incoming };
	var outgoing_relationship = { id, nickname: undefined, type: RelationshipType.outgoing };

	if (friendRequest) {
		if (friendRequest.type === RelationshipType.blocked) throw new HTTPError("The user blocked you");
		// accept friend request
		// @ts-ignore
		incoming_relationship = friendRequest;
		incoming_relationship.type = RelationshipType.friends;
		outgoing_relationship.type = RelationshipType.friends;
	} else newFriendRelationships.push(incoming_relationship);

	if (relationship) {
		if (relationship.type === RelationshipType.outgoing) throw new HTTPError("You already sent a friend request");
		if (relationship.type === RelationshipType.blocked) throw new HTTPError("Unblock the user before sending a friend request");
		if (relationship.type === RelationshipType.friends) throw new HTTPError("You are already friends with the user");
	} else newUserRelationships.push(outgoing_relationship);

	await Promise.all([
		User.update({ id: req.user_id }, { "user_data.relationships": newUserRelationships }),
		User.update({ id: friend.id }, { "user_data.relationships": newFriendRelationships }),
		emitEvent({
			event: "RELATIONSHIP_ADD",
			data: {
				...outgoing_relationship,
				user: { ...friend, user_data: undefined }
			},
			user_id: req.user_id
		} as RelationshipAddEvent),
		emitEvent({
			event: "RELATIONSHIP_ADD",
			data: {
				...incoming_relationship,
				should_notify: true,
				user: { ...user, user_data: undefined }
			},
			user_id: id
		} as RelationshipAddEvent)
	]);

	return res.sendStatus(204);
}

router.put("/:id", check({ $type: new Length(Number, 1, 4) }), async (req: Request, res: Response) => {
	return await addRelationship(req, res, await User.findOneOrFail({ id: req.params.id }), req.body.type);
});

router.post("/", check({ discriminator: String, username: String }), async (req: Request, res: Response) => {
	return await addRelationship(
		req,
		res,
		await User.findOneOrFail(req.body as { discriminator: string; username: string }),
		req.body.type
	);
});

router.delete("/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	if (id === req.user_id) throw new HTTPError("You can't remove yourself as a friend");

	const user = await User.findOneOrFail({ id: req.user_id });
	if (!user) throw new HTTPError("Invalid token", 400);

	const friend = await User.findOneOrFail({ id }, userProjection);
	if (!friend) throw new HTTPError("User not found", 404);

	const relationship = user.user_data.relationships.find((x) => x.id === id);
	const friendRequest = friend.user_data.relationships.find((x) => x.id === req.user_id);
	if (relationship?.type === RelationshipType.blocked) {
		// unblock user
		user.user_data.relationships.remove(relationship);

		await Promise.all([
			user.save(),
			emitEvent({ event: "RELATIONSHIP_REMOVE", user_id: req.user_id, data: relationship } as RelationshipRemoveEvent)
		]);
		return res.sendStatus(204);
	}
	if (!relationship || !friendRequest) throw new HTTPError("You are not friends with the user", 404);
	if (friendRequest.type === RelationshipType.blocked) throw new HTTPError("The user blocked you");

	user.user_data.relationships.remove(relationship);
	friend.user_data.relationships.remove(friendRequest);

	await Promise.all([
		user.save(),
		friend.save(),
		emitEvent({
			event: "RELATIONSHIP_REMOVE",
			data: relationship,
			user_id: req.user_id
		} as RelationshipRemoveEvent),
		emitEvent({
			event: "RELATIONSHIP_REMOVE",
			data: friendRequest,
			user_id: id
		} as RelationshipRemoveEvent)
	]);

	return res.sendStatus(204);
});

export default router;
