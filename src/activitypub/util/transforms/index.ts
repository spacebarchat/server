import { APError, fetchOpts } from "@spacebar/ap";
import {
	Channel,
	Config,
	DmChannelDTO,
	Member,
	Message,
	Snowflake,
	User,
	UserSettings,
	WebfingerResponse,
} from "@spacebar/util";
import { APNote, APPerson, AnyAPObject } from "activitypub-types";
import fetch from "node-fetch";
import { ProxyAgent } from "proxy-agent";
import TurndownService from "turndown";

const hasAPContext = (data: object) => {
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

export const resolveWebfinger = async (
	lookup: string,
): Promise<AnyAPObject> => {
	let domain: string, user: string;
	if (lookup.includes("@")) {
		// lookup a @handle

		if (lookup[0] == "@") lookup = lookup.slice(1);
		[domain, user] = lookup.split("@");
	} else {
		// lookup was a URL ( hopefully )
		const url = new URL(lookup);
		domain = url.hostname;
		user = url.pathname.split("/").reverse()[0];
	}

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

	return await resolveAPObject<AnyAPObject>(link.href);
};

export const messageFromAP = async (data: APNote): Promise<Message> => {
	if (!data.id) throw new APError("Message must have ID");
	if (data.type != "Note") throw new APError("Message must be Note");

	if (!data.attributedTo)
		throw new APError("Message must have author (attributedTo)");
	const attrib = await resolveAPObject(
		Array.isArray(data.attributedTo)
			? data.attributedTo[0] // hmm
			: data.attributedTo,
	);

	if (!APObjectIsPerson(attrib))
		throw new APError("Message attributedTo must be Person");

	const user = await userFromAP(attrib);

	const to = Array.isArray(data.to)
		? data.to.filter((x) =>
				typeof x == "string"
					? x.includes("channel") || x.includes("user")
					: false,
		  )[0]
		: data.to;
	if (!to || typeof to != "string")
		throw new APError("Message not deliverable");

	// TODO: use a regex

	let channel: Channel | DmChannelDTO;
	const to_id = to.split("/").reverse()[0];
	if (to.includes("user")) {
		// this is a DM channel
		const toUser = await User.findOneOrFail({ where: { id: to_id } });

		// Channel.createDMCHannel does a .save() so the author must be present
		await user.save();

		// const cache = await Channel.findOne({ where: { recipients: []}})

		channel = await Channel.createDMChannel(
			[toUser.id, user.id],
			toUser.id,
		);
	} else {
		channel = await Channel.findOneOrFail({
			where: { id: to_id },
			relations: { guild: true },
		});
	}

	const member =
		channel instanceof Channel
			? await Member.findOneOrFail({
					where: { id: user.id, guild_id: channel.guild!.id },
			  })
			: undefined;

	return Message.create({
		id: Snowflake.generate(),
		federatedId: data.id,
		content: new TurndownService().turndown(data.content),
		timestamp: data.published,
		author: user,
		guild: channel instanceof Channel ? channel.guild : undefined,
		member,
		channel_id: channel.id,

		type: 0,
		sticker_items: [],
		attachments: [],
		embeds: [],
		reactions: [],
		mentions: [],
		mention_roles: [],
		mention_channels: [],
	});
};

export const APObjectIsPerson = (object: AnyAPObject): object is APPerson => {
	return object.type == "Person";
};

export const userFromAP = async (data: APPerson): Promise<User> => {
	if (!data.id) throw new APError("User must have ID");

	const url = new URL(data.id);
	const email = `${url.pathname.split("/").reverse()[0]}@${url.hostname}`;

	// don't like this
	// the caching should probably be done elsewhere
	// this function should only be for converting AP to SB (ideally)
	const cache = await User.findOne({
		where: { federatedId: url.toString() },
	});
	if (cache) return cache;

	return User.create({
		federatedId: url.toString(),
		username: data.preferredUsername,
		discriminator: url.hostname,
		bio: new TurndownService().turndown(data.summary),
		email,
		data: {
			hash: "#",
			valid_tokens_since: new Date(),
		},
		extended_settings: "{}",
		settings: UserSettings.create(),
		publicKey: "",
		privateKey: "",
		premium: false,

		premium_since: Config.get().defaults.user.premium
			? new Date()
			: undefined,
		rights: Config.get().register.defaultRights,
		premium_type: Config.get().defaults.user.premiumType ?? 0,
		verified: Config.get().defaults.user.verified ?? true,
		created_at: new Date(),
	});
};
