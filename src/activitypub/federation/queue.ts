import { Config, FederationKey } from "@spacebar/util";
import { AP } from "activitypub-core-types";
import fetch from "node-fetch";
import {
	APError,
	resolveWebfinger,
	signActivity,
	splitQualifiedMention,
} from "./utils";

//
type Instance = string;

class FederationQueue {
	// TODO: queue messages and send them to shared inbox
	private queue: Map<Instance, Array<AP.Activity>> = new Map();

	public async distribute(activity: AP.Activity) {
		let { to, actor } = activity;

		if (!to)
			throw new APError("Activity with no `to` field is undeliverable.");
		if (!Array.isArray(to)) to = [to];

		if (!actor)
			throw new APError("Activity with no `to` field is undeliverable.");
		if (Array.isArray(actor)) actor = actor[0];

		// TODO: check if `to` is on our instance?
		// we shouldn't get to this point if they are, though.

		// if the sender is one of ours, fetch their private key for signing
		const { user } = splitQualifiedMention(actor.toString());
		const sender = await FederationKey.findOneOrFail({
			where: { actorId: user, domain: Config.get().federation.host },
		});

		if (!sender.privateKey) {
			console.warn(
				"tried to federate activity who's sender does not have a private key",
			);
			return;
		}

		for (const receiver of to) {
			if (!(receiver instanceof URL)) {
				console.error(receiver);
				continue;
			}

			const apReceiver = await resolveWebfinger(receiver.toString());
			if (!("inbox" in apReceiver)) {
				console.error(
					"[federation] receiver doesn't have inbox",
					apReceiver,
				);
				continue;
			}

			if (typeof apReceiver.inbox != "string") {
				console.error(apReceiver.inbox);
				continue;
			}

			const signedActivity = await signActivity(
				apReceiver.inbox,
				sender,
				activity,
			);

			await fetch(apReceiver.inbox, signedActivity);
		}
	}
}

export const federationQueue = new FederationQueue();
