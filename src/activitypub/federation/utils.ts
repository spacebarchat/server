import { DEFAULT_FETCH_OPTIONS } from "@spacebar/api";
import {
	ActorType,
	BaseClass,
	Config,
	Debug,
	FederationActivity,
	FederationCache,
	FederationKey,
	Guild,
	OrmUtils,
	Snowflake,
	User,
	UserSettings,
	WebfingerResponse,
} from "@spacebar/util";
import {
	APObject,
	APPerson,
	AnyAPObject,
	ObjectIsGroup,
	ObjectIsOrganization,
	ObjectIsPerson,
} from "activitypub-types";
import { HTTPError } from "lambert-server";
import fetch from "node-fetch";
import { ProxyAgent } from "proxy-agent";
import TurndownService from "turndown";
import { federationQueue } from "./queue";
import { APFollowWithInvite } from "./types";

export const ACTIVITYSTREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";
export const LOG_NAMES = {
	webfinger: "Webfinger",
	remote: "Remote",
};

export const fetchOpts = Object.freeze(
	OrmUtils.mergeDeep(DEFAULT_FETCH_OPTIONS, {
		headers: {
			Accept: "application/activity+json",
			"Content-Type": "application/activity+json",
		},
	}),
);

export class APError extends HTTPError {}

export const hasAPContext = (data: object): data is APObject => {
	if (!("@context" in data)) return false;
	const context = data["@context"];
	if (Array.isArray(context))
		return !!context.find((x) => x == ACTIVITYSTREAMS_CONTEXT);
	return context == ACTIVITYSTREAMS_CONTEXT;
};

export const resolveAPObject = async <T extends AnyAPObject>(
	data: string | T,
): Promise<T> => {
	// we were already given an object
	if (typeof data != "string") return data;

	const cache = await FederationCache.findOne({ where: { id: data } });
	if (cache) return cache.toJSON() as T;

	Debug(LOG_NAMES.remote, `Fetching from remote ${data}`);

	const agent = new ProxyAgent();
	const ret = await fetch(data, {
		...fetchOpts,
		agent,
	});

	const json = await ret.json();

	if (!hasAPContext(json)) throw new APError("Object is not APObject");

	setImmediate(async () => {
		await FederationCache.create({ id: json.id, data: json }).save();
	});

	return json as T;
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
): Promise<AnyAPObject> => {
	const { domain } = splitQualifiedMention(lookup);

	Debug(LOG_NAMES.webfinger, `Performing lookup ${lookup}`);

	const agent = new ProxyAgent();
	const wellknown = (await fetch(
		`https://${domain}/.well-known/webfinger?resource=${lookup}`,
		{
			agent,
			...fetchOpts,
		},
	).then((x) => x.json())) as WebfingerResponse;

	if (!("links" in wellknown))
		throw new APError(
			`webfinger did not return any links for actor ${lookup}`,
		);

	const link = wellknown.links.find((x) => x.rel == "self");
	if (!link) throw new APError(".well-known did not contain rel=self link");

	return await resolveAPObject<AnyAPObject>(link.href);
};

export const tryResolveWebfinger = async (lookup: string) => {
	try {
		return await resolveWebfinger(lookup);
	} catch (e) {
		console.error(`Error resolving webfinger ${lookup}`, e);
		return null;
	}
};

/** Fetch from local db, if not found fetch from remote instance and save */
export const fetchFederatedUser = async (
	actorId: string,
): Promise<{ keys: FederationKey; entity: BaseClass }> => {
	// if we were given webfinger, resolve that first
	const mention = splitQualifiedMention(actorId);
	const cache = await FederationKey.findOne({
		where: { username: mention.user, domain: mention.domain },
	});
	if (cache) {
		return {
			keys: cache,
			entity: await User.findOneOrFail({ where: { id: cache.actorId } }),
		};
	}

	// if we don't already have it, resolve webfinger
	const remoteActor = await resolveWebfinger(actorId);

	let type: ActorType;
	if (ObjectIsPerson(remoteActor)) type = ActorType.USER;
	else if (ObjectIsGroup(remoteActor)) type = ActorType.CHANNEL;
	else if (ObjectIsOrganization(remoteActor)) type = ActorType.GUILD;
	else
		throw new APError(
			`The remote actor '${actorId}' is not a Person, Group, or Organisation`,
		);

	if (
		typeof remoteActor.inbox != "string" ||
		typeof remoteActor.outbox != "string"
	)
		throw new APError("Actor inbox/outbox must be string");

	const keys = FederationKey.create({
		actorId: Snowflake.generate(),
		federatedId: actorId,
		username: remoteActor.name,
		// this is technically not correct
		// but it's slightly more difficult to go from actor url -> handle
		// so thats a problem for future me
		domain: mention.domain,
		publicKey: remoteActor.publicKey?.publicKeyPem,
		type,
		inbox: remoteActor.inbox,
		outbox: remoteActor.outbox,
	});

	let entity: BaseClass | undefined = undefined;
	if (type == ActorType.USER)
		entity = User.create({
			id: keys.actorId,
			username: remoteActor.name,
			discriminator: "0",
			bio: new TurndownService().turndown(remoteActor.summary), // html -> markdown
			email: `${remoteActor.preferredUsername}@${keys.domain}`,
			data: {
				hash: "#",
				valid_tokens_since: new Date(),
			},
			extended_settings: "{}",
			settings: UserSettings.create(),
			premium: false,

			premium_since: Config.get().defaults.user.premium
				? new Date()
				: undefined,
			rights: Config.get().register.defaultRights,
			premium_type: Config.get().defaults.user.premiumType ?? 0,
			verified: Config.get().defaults.user.verified ?? true,
			created_at: new Date(),
		});

	if (type == ActorType.GUILD)
		entity = Guild.create({
			id: keys.actorId,
			name: remoteActor.name,
			owner_id: (
				await fetchFederatedUser(remoteActor.attributedTo!.toString())
			).entity.id,
		});

	if (!entity) throw new APError("not possible :3");

	await Promise.all([keys.save(), entity.save()]);
	return {
		keys,
		entity,
	};
};

export const tryFederatedGuildJoin = async (code: string, user_id: string) => {
	const guild = await tryResolveWebfinger(code);
	if (!guild || !ObjectIsOrganization(guild))
		throw new APError(
			`Invite code did not produce Guild on remote server ${code}`,
		);

	const { host } = Config.get().federation;

	const follow = await FederationActivity.create({
		data: {
			"@context": ACTIVITYSTREAMS_CONTEXT,
			type: "Follow",
			actor: `https://${host}/federation/users/${user_id}`,
			object: guild.id,
			invite: code,
		} as APFollowWithInvite,
	}).save();

	await federationQueue.distribute(follow.toJSON());
};

export const APObjectIsSpacebarActor = (
	object: AnyAPObject,
): object is APPerson => {
	return (
		ObjectIsPerson(object) ||
		ObjectIsGroup(object) ||
		ObjectIsOrganization(object)
	);
};
