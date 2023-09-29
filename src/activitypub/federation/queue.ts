import { Config, Debug, FederationKey } from "@spacebar/util";
import { APActivity, ActivityIsFollow } from "activitypub-types";
import fetch from "node-fetch";
import { HttpSig } from "./HttpSig";
import { APError, LOG_NAMES, splitQualifiedMention } from "./utils";

//
type Instance = string;

class FederationQueue {
	// TODO: queue messages and send them to shared inbox
	private queue: Map<Instance, Array<APActivity>> = new Map();

	public async distribute(activity: APActivity) {
		let { actor } = activity;
		const { to, object } = activity;

		Debug(LOG_NAMES.remote, `distributing activity ${activity.id}`);

		if (!actor)
			throw new APError("Activity with no actor cannot be signed.");
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

		// this is ugly
		for (let recv of [
			...(Array.isArray(to) ? to : [to]),
			...(Array.isArray(object) ? object : [object]),
		]) {
			if (!recv) continue;

			// this is wrong?
			if (typeof recv != "string") {
				if (ActivityIsFollow(recv)) {
					recv = recv.actor!.toString();
				} else continue;
			}

			if (recv == "https://www.w3.org/ns/activitystreams#Public") {
				console.debug(`TODO: Skipping sending activity to #Public`);
				continue;
			}

			if (recv.includes("/followers")) {
				console.warn("sending to /followers is not implemented");
				continue;
			}

			// TODO: this is bad
			if (!recv.includes("/inbox")) recv = `${recv}/inbox`;

			Debug(LOG_NAMES.remote, `sending activity to ${recv}`);
			await this.signAndSend(activity, sender, recv);
		}
	}

	private async signAndSend(
		activity: APActivity,
		sender: FederationKey,
		receiver: string,
	) {
		const signedActivity = await HttpSig.sign(
			receiver.toString(),
			sender,
			activity,
		);

		const ret = await fetch(receiver, signedActivity);
		if (!ret.ok) {
			console.error(
				`Sending activity ${activity.id} to ` +
					`${receiver} failed with code ${ret.status} `,
				JSON.stringify(await ret.json()),
			);
		}
	}
}

export const federationQueue = new FederationQueue();
