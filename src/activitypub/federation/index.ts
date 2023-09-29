import { MessageCreateEvent, emitEvent } from "@spacebar/util";
import { APActivity, ActivityIsCreate, ObjectIsNote } from "activitypub-types";
import { Request } from "express";
import { HttpSig } from "./HttpSig";
import { federationQueue } from "./queue";
import { transformNoteToMessage } from "./transforms";
import { APError, hasAPContext } from "./utils";

export * from "./OrderedCollection";
export * from "./transforms";
export * from "./utils";

export class Federation {
	static async distribute(activity: APActivity) {
		await federationQueue.distribute(activity);
	}

	static async genericInboxHandler(req: Request) {
		const activity = req.body;

		if (!hasAPContext(activity))
			throw new APError("Activity does not have @context");

		if (!(await HttpSig.validate(req.originalUrl, activity, req.headers))) {
			throw new APError("Invalid signature");
		}

		if (!ActivityIsCreate(activity))
			throw new APError(
				`activity of type ${activity.type} not implemented`,
			);

		const object = Array.isArray(activity.object)
			? activity.object[0]
			: activity.object;

		if (!object || typeof object == "string" || !ObjectIsNote(object))
			throw new APError("not implemented");

		const message = await transformNoteToMessage(object);

		await Promise.all([
			emitEvent({
				event: "MESSAGE_CREATE",
				channel_id: message.channel_id,
				data: message,
			} as MessageCreateEvent),
			message.save(),
		]);

		return;
	}
}
