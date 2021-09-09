import {
	RelationshipAddEvent,
	User,
	PublicUserProjection,
	RelationshipType,
	RelationshipRemoveEvent,
	emitEvent,
	Relationship,
	Config
} from "@fosscord/util";
import { Router, Response, Request } from "express";
import { HTTPError } from "lambert-server";
import { DiscordApiErrors } from "@fosscord/util";

import { check, Length } from "../../../util/instanceOf";

const router = Router();

const userProjection: (keyof User)[] = ["relationships", ...PublicUserProjection];

router.get("/", async (req: Request, res: Response) => {
	const user = await User.findOneOrFail({ where: { id: req.user_id }, select: ["relationships"] });

	return res.json(user.relationships);
});

async function updateRelationship(req: Request, res: Response, friend: User, type: RelationshipType) {
	const id = friend.id;
	if (id === req.user_id) throw new HTTPError("You can't add yourself as a friend");

	const user = await User.findOneOrFail({ id: req.user_id }, { relations: ["relationships"], select: userProjection });

	var relationship = user.relationships.find((x) => x.id === id);
	const friendRequest = friend.relationships.find((x) => x.id === req.user_id);

	// TODO: you can add infinitely many blocked users (should this be prevented?)
	if (type === RelationshipType.blocked) {
		if (relationship) {
			if (relationship.type === RelationshipType.blocked) throw new HTTPError("You already blocked the user");
			relationship.type = RelationshipType.blocked;
		} else {
			relationship = new Relationship({ id, type: RelationshipType.blocked });
			user.relationships.push(relationship);
		}

		if (friendRequest && friendRequest.type !== RelationshipType.blocked) {
			friend.relationships.remove(friendRequest);
			await Promise.all([
				user.save(),
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
					...relationship,
					user: { ...friend }
				},
				user_id: req.user_id
			} as RelationshipAddEvent)
		]);

		return res.sendStatus(204);
	}

	const { maxFriends } = Config.get().limits.user;
	if (user.relationships.length >= maxFriends) throw DiscordApiErrors.MAXIMUM_FRIENDS.withParams(maxFriends);

	var incoming_relationship = new Relationship({ nickname: undefined, type: RelationshipType.incoming, id: req.user_id });
	var outgoing_relationship = new Relationship({ nickname: undefined, type: RelationshipType.outgoing, id });

	if (friendRequest) {
		if (friendRequest.type === RelationshipType.blocked) throw new HTTPError("The user blocked you");
		// accept friend request
		incoming_relationship = friendRequest;
		incoming_relationship.type = RelationshipType.friends;
		outgoing_relationship.type = RelationshipType.friends;
	} else friend.relationships.push(incoming_relationship);

	if (relationship) {
		if (relationship.type === RelationshipType.outgoing) throw new HTTPError("You already sent a friend request");
		if (relationship.type === RelationshipType.blocked) throw new HTTPError("Unblock the user before sending a friend request");
		if (relationship.type === RelationshipType.friends) throw new HTTPError("You are already friends with the user");
	} else user.relationships.push(outgoing_relationship);

	await Promise.all([
		user.save(),
		friend.save(),
		emitEvent({
			event: "RELATIONSHIP_ADD",
			data: {
				...outgoing_relationship,
				user: { ...friend }
			},
			user_id: req.user_id
		} as RelationshipAddEvent),
		emitEvent({
			event: "RELATIONSHIP_ADD",
			data: {
				...incoming_relationship,
				should_notify: true,
				user: { ...user }
			},
			user_id: id
		} as RelationshipAddEvent)
	]);

	return res.sendStatus(204);
}

router.put("/:id", check({ $type: new Length(Number, 1, 4) }), async (req: Request, res: Response) => {
	return await updateRelationship(
		req,
		res,
		await User.findOneOrFail({ id: req.params.id }, { relations: ["relationships"], select: userProjection }),
		req.body.type
	);
});

router.post("/", check({ discriminator: String, username: String }), async (req: Request, res: Response) => {
	return await updateRelationship(
		req,
		res,
		await User.findOneOrFail({
			relations: ["relationships"],
			select: userProjection,
			where: req.body as { discriminator: string; username: string }
		}),
		req.body.type
	);
});

router.delete("/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	if (id === req.user_id) throw new HTTPError("You can't remove yourself as a friend");

	const user = await User.findOneOrFail({ id: req.user_id }, { select: userProjection, relations: ["relationships"] });
	const friend = await User.findOneOrFail({ id: id }, { select: userProjection, relations: ["relationships"] });

	const relationship = user.relationships.find((x) => x.id === id);
	const friendRequest = friend.relationships.find((x) => x.id === req.user_id);

	if (relationship?.type === RelationshipType.blocked) {
		// unblock user
		user.relationships.remove(relationship);

		await Promise.all([
			user.save(),
			emitEvent({ event: "RELATIONSHIP_REMOVE", user_id: req.user_id, data: relationship } as RelationshipRemoveEvent)
		]);
		return res.sendStatus(204);
	}
	if (!relationship || !friendRequest) throw new HTTPError("You are not friends with the user", 404);
	if (friendRequest.type === RelationshipType.blocked) throw new HTTPError("The user blocked you");

	user.relationships.remove(relationship);
	friend.relationships.remove(friendRequest);

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
