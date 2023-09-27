import { Config, FederationKey } from "@spacebar/util";
import { APActivity } from "activitypub-types";
import fetch from "node-fetch";
import { HttpSig } from "./HttpSig";
import { APError, splitQualifiedMention } from "./utils";

//
type Instance = string;

class FederationQueue {
	// TODO: queue messages and send them to shared inbox
	private queue: Map<Instance, Array<APActivity>> = new Map();

	public async distribute(activity: APActivity) {
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
			if (typeof receiver != "string") {
				console.error(receiver);
				continue;
			}

			const signedActivity = await HttpSig.sign(
				receiver.toString(),
				sender,
				activity,
			);

			const ret = await fetch(receiver, signedActivity);

			console.log(ret);
		}
	}
}

export const federationQueue = new FederationQueue();
