import { APError } from "@spacebar/ap";
import { DEFAULT_FETCH_OPTIONS } from "@spacebar/api";
import {
	Channel,
	Config,
	Member,
	Message,
	OrmUtils,
	Snowflake,
	User,
	UserSettings,
} from "@spacebar/util";
import { APNote, APPerson, AnyAPObject } from "activitypub-types";
import fetch from "node-fetch";
import { ProxyAgent } from "proxy-agent";
import TurndownService from "turndown";

const fetchOpts = OrmUtils.mergeDeep(DEFAULT_FETCH_OPTIONS, {
	headers: {
		Accept: "application/activity+json",
	},
});

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

export const messageFromAP = async (data: APNote): Promise<Message> => {
	if (!data.id) throw new APError("Message must have ID");
	if (data.type != "Note") throw new APError("Message must be Note");

	const to = Array.isArray(data.to)
		? data.to.filter((x) =>
				typeof x == "string" ? x.includes("channel") : false,
		  )[0]
		: data.to;
	if (!to || typeof to != "string")
		throw new APError("Message not deliverable");

	// TODO: use a regex
	const channel_id = to.split("/").reverse()[0];
	const channel = await Channel.findOneOrFail({
		where: { id: channel_id },
		relations: { guild: true },
	});

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
	const member = channel.guild
		? await Member.findOneOrFail({
				where: { id: user.id, guild_id: channel.guild.id },
		  })
		: undefined;

	return Message.create({
		id: data.id,
		content: new TurndownService().turndown(data.content),
		timestamp: data.published,
		author: user,
		guild: channel.guild,
		member,
		channel,

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

	return User.create({
		id: Snowflake.generate(),
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
