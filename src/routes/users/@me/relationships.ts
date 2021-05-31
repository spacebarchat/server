import {
	RelationshipAddEvent,
	UserModel,
	PublicUserProjection,
	toObject,
	RelationshipType,
	RelationshipRemoveEvent
} from "@fosscord/server-util";
import { Router, Response, Request } from "express";
import { check, HTTPError } from "lambert-server";
import { emitEvent } from "../../../util/Event";

const router = Router();

const userProjection = { "user_data.relationships": true, ...PublicUserProjection };

router.put("/:id", check({ $type: Number }), async (req: Request, res: Response) => {
	const { id } = req.params;
	if (id === req.user_id) throw new HTTPError("You can't add yourself as a friend");
	const body = req.body as { type?: number };

	const user = await UserModel.findOne({ id: req.user_id }, userProjection).exec();
	if (!user) throw new HTTPError("Invalid token", 400);

	const friend = await UserModel.findOne({ id }, userProjection).exec();
	if (!friend) throw new HTTPError("User not found", 404);

	var relationship = user.user_data.relationships.find((x) => x.id === id);
	const friendRequest = friend.user_data.relationships.find((x) => x.id === req.user_id);

	if (body.type === RelationshipType.blocked) {
		if (relationship) {
			if (relationship.type === RelationshipType.blocked) throw new HTTPError("You already blocked the user");
			relationship.type = RelationshipType.blocked;
		} else {
			relationship = { id, type: RelationshipType.blocked };
			user.user_data.relationships.push(relationship);
		}

		if (friendRequest && friendRequest.type !== RelationshipType.blocked) {
			friend.user_data.relationships.remove(friendRequest);
			await Promise.all([
				friend.save(),
				emitEvent({
					event: "RELATIONSHIP_REMOVE",
					data: friendRequest,
					user_id: id
				} as RelationshipRemoveEvent)
			]);
		}

		await Promise.all([
			user.save(),
			emitEvent({
				event: "RELATIONSHIP_ADD",
				data: {
					...toObject(relationship),
					user: { ...toObject(friend), user_data: undefined }
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
	} else friend.user_data.relationships.push(incoming_relationship);

	if (relationship) {
		if (relationship.type === RelationshipType.outgoing) throw new HTTPError("You already sent a friend request");
		if (relationship.type === RelationshipType.blocked) throw new HTTPError("Unblock the user before sending a friend request");
		if (relationship.type === RelationshipType.friends) throw new HTTPError("You are already friends with the user");
	} else user.user_data.relationships.push(outgoing_relationship);

	await Promise.all([
		user.save(),
		friend.save(),
		emitEvent({
			event: "RELATIONSHIP_ADD",
			data: {
				...outgoing_relationship,
				user: { ...toObject(friend), user_data: undefined }
			},
			user_id: req.user_id
		} as RelationshipAddEvent),
		emitEvent({
			event: "RELATIONSHIP_ADD",
			data: {
				...toObject(incoming_relationship),
				should_notify: true,
				user: { ...toObject(user), user_data: undefined }
			},
			user_id: id
		} as RelationshipAddEvent)
	]);

	return res.sendStatus(204);
});

router.delete("/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	if (id === req.user_id) throw new HTTPError("You can't remove yourself as a friend");

	const user = await UserModel.findOne({ id: req.user_id }).exec();
	if (!user) throw new HTTPError("Invalid token", 400);

	const friend = await UserModel.findOne({ id }, userProjection).exec();
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
