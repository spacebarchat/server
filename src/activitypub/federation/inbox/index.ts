import { Message, MessageCreateEvent, emitEvent } from "@spacebar/util";
import { APCreate, AnyAPObject, ObjectIsNote } from "activitypub-types";
import { Request } from "express";
import { HttpSig } from "../HttpSig";
import { transformNoteToMessage } from "../transforms";
import { APError, hasAPContext, resolveAPObject } from "../utils";

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
