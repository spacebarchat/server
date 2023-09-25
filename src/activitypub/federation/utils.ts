import { DEFAULT_FETCH_OPTIONS } from "@spacebar/api";
import {
	Config,
	FederationKey,
	OrmUtils,
	WebfingerResponse,
} from "@spacebar/util";
import { AP } from "activitypub-core-types";
import crypto from "crypto";
import { HTTPError } from "lambert-server";
import fetch from "node-fetch";
import { ProxyAgent } from "proxy-agent";

export const ACTIVITYSTREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";

export const fetchOpts = OrmUtils.mergeDeep(DEFAULT_FETCH_OPTIONS, {
	headers: {
		Accept: "application/activity+json",
	},
});

export class APError extends HTTPError {}

export const hasAPContext = (data: object) => {
	if (!("@context" in data)) return false;
	const context = data["@context"];
	const activitystreams = "https://www.w3.org/ns/activitystreams";
	if (Array.isArray(context))
		return context.find((x) => x == activitystreams);
	return context == activitystreams;
};

export const resolveAPObject = async <T>(data: string | T): Promise<T> => {
	// we were already given an AP object
	if (typeof data != "string") return data;

	const agent = new ProxyAgent();
	const ret = await fetch(data, {
		...fetchOpts,
		agent,
	});

	const json = await ret.json();

	if (!hasAPContext(json)) throw new APError("Object is not APObject");

	return json;
};

export const splitQualifiedMention = (lookup: string) => {
	let domain: string, user: string;
	if (lookup.includes("@")) {
		// lookup a @handle@domain

		if (lookup[0] == "@") lookup = lookup.slice(1);
		[user, domain] = lookup.split("@");
	} else {
		// lookup was a URL ( hopefully )
		try {
			const url = new URL(lookup);
			domain = url.hostname;
			user = url.pathname.split("/").reverse()[0];
		} catch (e) {
			domain = "";
			user = "";
		}
	}

	return {
		domain,
		user,
	};
};

export const resolveWebfinger = async (
	lookup: string,
): Promise<AP.CoreObject> => {
	const { domain } = splitQualifiedMention(lookup);

	const agent = new ProxyAgent();
	const wellknown = (await fetch(
		`https://${domain}/.well-known/webfinger?resource=${lookup}`,
		{
			agent,
			...fetchOpts,
		},
	).then((x) => x.json())) as WebfingerResponse;

	const link = wellknown.links.find((x) => x.rel == "self");
	if (!link) throw new APError(".well-known did not contain rel=self link");

	return await resolveAPObject<AP.CoreObject>(link.href);
};

/**
 * Returns a signed request that can be passed to fetch
 * ```
 * const signed = await signActivity(receiver.inbox, sender, activity);
 * await fetch(receiver.inbox, signed);
 * ```
 */
export const signActivity = async (
	inbox: string,
	sender: FederationKey,
	message: AP.Activity,
) => {
	if (!sender.privateKey)
		throw new APError("cannot sign without private key");

	const digest = crypto
		.createHash("sha256")
		.update(JSON.stringify(message))
		.digest("base64");
	const signer = crypto.createSign("sha256");
	const now = new Date();

	const url = new URL(inbox);
	const inboxFrag = url.pathname;
	const toSign =
		`(request-target): post ${inboxFrag}\n` +
		`host: ${url.hostname}\n` +
		`date: ${now.toUTCString()}\n` +
		`digest: SHA-256=${digest}`;

	signer.update(toSign);
	signer.end();

	const signature = signer.sign(sender.privateKey);
	const sig_b64 = signature.toString("base64");

	const { host } = Config.get().federation;
	const header =
		`keyId="${host}/${sender.type}/${sender.actorId}#main-key",` +
		`headers="(request-target) host date digest",` +
		`signature=${sig_b64}`;

	return OrmUtils.mergeDeep(fetchOpts, {
		method: "POST",
		body: message,
		headers: {
			Host: url.hostname,
			Date: now.toUTCString(),
			Digest: `SHA-256=${digest}`,
			Signature: header,
		},
	});
};

// fetch from remote server?
export const APObjectIsPerson = (
	object: AP.EntityReference,
): object is AP.Person => {
	return "type" in object && object.type == "Person";
};

export const APObjectIsGroup = (
	object: AP.EntityReference,
): object is AP.Person => {
	return "type" in object && object.type == "Group";
};

export const APObjectIsOrganisation = (
	object: AP.EntityReference,
): object is AP.Person => {
	return "type" in object && object.type == "Organization";
};

export const APObjectIsSpacebarActor = (
	object: AP.EntityReference,
): object is AP.Person => {
	return (
		APObjectIsGroup(object) ||
		APObjectIsOrganisation(object) ||
		APObjectIsPerson(object)
	);
};
