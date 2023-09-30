import {
	ActorType,
	FederationActivity,
	FederationKey,
	Invite,
	Member,
	Message,
	MessageCreateEvent,
	emitEvent,
} from "@spacebar/util";
import {
	APAccept,
	APCreate,
	APFollow,
	ActivityIsFollow,
	AnyAPObject,
	ObjectIsNote,
	ObjectIsOrganization,
} from "activitypub-types";
import { Request } from "express";
import { HttpSig } from "../HttpSig";
import { federationQueue } from "../queue";
import {
	transformNoteToMessage,
	transformOrganisationToGuild,
} from "../transforms";
import { APFollowWithInvite } from "../types";
import {
	ACTIVITYSTREAMS_CONTEXT,
	APError,
	createChannelsFromGuildFollows,
	fetchFederatedUser,
	hasAPContext,
	resolveAPObject,
	splitQualifiedMention,
} from "../utils";

/**
 * Key names are derived from the object type names
 * I.e:
 * * a Note wrapped in a Create becomes `"CreateNote"`
 *
 * If a handler exists for the activity, it'll be called
 * Otherwise, activity.object will be fetched and the
 * handler for `${ActivityType}${ObjectType}` will be called
 */
const handlers = {
	// TODO: support lemmy ChatMessage type?
	CreateNote: async (activity: APCreate) => {
		const object = Array.isArray(activity.object)
			? activity.object[0]
			: activity.object;

		if (!object || typeof object == "string" || !ObjectIsNote(object))
			throw new APError("not implemented");

		const message = await transformNoteToMessage(object);
		if ((await Message.count({ where: { nonce: message.nonce } })) != 0)
			return; // already sent

		await Promise.all([
			emitEvent({
				event: "MESSAGE_CREATE",
				channel_id: message.channel_id,
				data: message,
			} as MessageCreateEvent),
			message.save(),
		]);
	},

	Follow: async (activity: APFollow) => {
		if (typeof activity.object != "string")
			throw new APError("not implemented");
		const mention = splitQualifiedMention(activity.object);

		const keys = await FederationKey.findOneOrFail({
			where: { domain: mention.domain, actorId: mention.user },
		});

		switch (keys.type) {
			case ActorType.GUILD:
				if (typeof activity.actor != "string")
					throw new APError("not implemented");
				return addRemoteUserToGuild(activity.actor, keys, activity);
			default:
				throw new APError("not implemented");
		}
	},

	Accept: async (activity: APAccept) => {
		// check what this accept is for

		if (!activity.object)
			throw new APError(
				"Received Accept activity without object, what was accepted?",
			);

		const inner = await resolveAPObject(
			Array.isArray(activity.object)
				? activity.object[0]
				: activity.object,
		);

		if (!ActivityIsFollow(inner))
			throw new APError(
				"Accept received for activity other than Follow, ignoring",
			);

		// if it's for a guild join,

		if (typeof inner.object != "string")
			throw new APError("not implemented");

		const apGuild = await resolveAPObject(inner.object);
		if (!ObjectIsOrganization(apGuild))
			throw new APError(
				"Accept Follow received for object other than Organisation ( Guild ), Ignoring",
			);

		if (!apGuild.following || typeof apGuild.following != "string")
			throw new APError("Guild must be following channels");

		const guild = await transformOrganisationToGuild(apGuild);

		// create the channels

		await createChannelsFromGuildFollows(
			apGuild.following + "?page=true", // TODO: wrong
			guild.id,
		);

		if (typeof inner.actor != "string")
			throw new APError("not implemented");

		const { user } = splitQualifiedMention(inner.actor);
		Member.addToGuild(user, guild.id);
	},
} as Record<string, (activity: AnyAPObject) => Promise<unknown>>;

export const genericInboxHandler = async (req: Request) => {
	const activity = req.body;

	if (!hasAPContext(activity))
		throw new APError("Activity does not have @context");

	if (!(await HttpSig.validate(req.originalUrl, activity, req.headers))) {
		throw new APError("Invalid signature");
	}

	if (!activity.type) throw new APError("Object does not have type");
	if (Array.isArray(activity.type))
		throw new APError("Object with multiple types not implemented");

	let type = activity.type;

	// If we have a handler for the activity, use that
	let handler = handlers[type];
	if (handler) return await handler(activity);

	// otherwise, check the inner object and find a handler with name ActivityObject

	// TODO: isn't fetching the inner object somewhat easily abused by an attacker?

	if ("object" in activity && activity.object) {
		if (Array.isArray(activity.object))
			throw new APError("Multiple inner objects not implemented");

		const inner = await resolveAPObject<AnyAPObject>(activity.object);
		activity.object = inner;
		type += inner.type;
	}

	handler = handlers[type];
	if (handler) return await handler(activity);

	console.warn(`Activity of type ${type} not implemented`);
	throw new APError(`Activity of type ${type} not implemented`);
};

const addRemoteUserToGuild = async (
	actor: string,
	guild: FederationKey,
	follow: APFollow,
) => {
	const invite = (follow as APFollowWithInvite).invite;
	if (!invite) throw new APError("Requires invite");

	await Invite.findOneOrFail({
		where: {
			guild_id: guild.actorId,
			code: splitQualifiedMention(invite).user,
		},
	});

	const { entity, keys } = await fetchFederatedUser(actor);

	await Member.addToGuild(entity.id, guild.actorId);

	const accept = await FederationActivity.create({
		data: {
			type: "Accept",
			"@context": ACTIVITYSTREAMS_CONTEXT,
			actor: guild.federatedId,
			object: follow,
		} as APAccept,
	}).save();

	federationQueue.distribute(accept.toJSON());
};
