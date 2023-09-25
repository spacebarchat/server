import {
	ActorType,
	Channel,
	Config,
	DmChannelDTO,
	FederationKey,
	Member,
	Message,
	Snowflake,
	User,
	UserSettings,
} from "@spacebar/util";
import { AP } from "activitypub-core-types";
import TurndownService from "turndown";
import {
	ACTIVITYSTREAMS_CONTEXT,
	APError,
	APObjectIsPerson,
	resolveAPObject,
} from "./utils";

export const transformMessageToAnnounceNoce = async (
	message: Message,
): Promise<AP.Announce> => {
	const { host } = Config.get().federation;

	return {
		"@context": ACTIVITYSTREAMS_CONTEXT,
		type: "Announce",
		id: new URL(
			`https://${host}/federation/channels/${message.channel_id}/messages/${message.id}`,
		),
		actor: new URL(`https://${host}/federation/users/${message.author_id}`),
		published: message.timestamp,
		to: [
			new URL(
				`https://${host}/federation/channels/${message.channel_id}/followers`,
			),
		],
		object: await transformMessageToNote(message),
	};
};

export const transformMessageToNote = async (
	message: Message,
): Promise<AP.Note> => {
	const { host } = Config.get().federation;

	const referencedMessage = message.message_reference
		? await Message.findOne({
				where: { id: message.message_reference.message_id },
		  })
		: null;

	return {
		id: new URL(`https://${host}/federation/messages/${message.id}`),
		type: "Note",
		content: message.content, // TODO: convert markdown to html
		inReplyTo: referencedMessage
			? await transformMessageToNote(referencedMessage)
			: undefined,
		published: message.timestamp,
		attributedTo: new URL(
			`https://${host}/federation/users/${message.author_id}`,
		),
		to: [
			new URL(
				`https://${host}/federation/channels/${message.channel_id}`,
			),
		],
		tag: message.mentions?.map(
			(x) => new URL(`https://${host}/federation/users/${x.id}`),
		),
		attachment: [],
		// replies: [],
		// sbType: message.type,
		// embeds: [],
		// flags: message.flags,
	};
};

// TODO: this was copied from the previous implemention. refactor it.
export const transformNoteToMessage = async (note: AP.Note) => {
	if (!note.id) throw new APError("Note must have ID");
	if (note.type != "Note") throw new APError("Message must be Note");

	if (!note.attributedTo)
		throw new APError("Note must have author (attributedTo");

	const attrib = await resolveAPObject(
		Array.isArray(note.attributedTo)
			? note.attributedTo[0]
			: note.attributedTo,
	);

	if (!APObjectIsPerson(attrib))
		throw new APError("Note must be attributedTo a Person");

	const user = await transformPersonToUser(attrib);

	const to = Array.isArray(note.to) ? note.to[0] : note.to;

	let channel: Channel | DmChannelDTO;
	const to_id = to?.toString().split("/").reverse()[0];
	if (to?.toString().includes("user")) {
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
		content: new TurndownService().turndown(note.content),
		timestamp: note.published,
		author: user,
		guild: channel instanceof Channel ? channel.guild : undefined,
		member,
		channel_id: channel.id,

		nonce: note.id.toString(),
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

export const transformChannelToGroup = async (
	channel: Channel,
): Promise<AP.Group> => {
	const { host, accountDomain } = Config.get().federation;

	const keys = await FederationKey.findOneOrFail({
		where: { actorId: channel.id, domain: accountDomain },
	});

	return {
		"@context": "https://www.w3.org/ns/activitystreams",
		type: "Group",
		id: new URL(`https://${host}/fed/channels/${channel.id}`),
		name: channel.name,
		preferredUsername: channel.id,
		summary: channel.topic,
		icon: undefined,
		// discoverable: true,

		publicKey: {
			id: `https://${host}/fed/user/${channel.id}#main-key`,
			owner: `https://${host}/fed/user/${channel.id}`,
			publicKeyPem: keys.publicKey,
		},

		inbox: new URL(`https://${host}/fed/channels/${channel.id}/inbox`),
		outbox: new URL(`https://${host}/fed/channels/${channel.id}/outbox`),
		followers: new URL(
			`https://${host}/fed/channels/${channel.id}/followers`,
		),
	};
};

export const transformUserToPerson = async (user: User): Promise<AP.Person> => {
	const { host, accountDomain } = Config.get().federation;

	const keys = await FederationKey.findOneOrFail({
		where: { actorId: user.id, domain: accountDomain },
	});

	return {
		"@context": ACTIVITYSTREAMS_CONTEXT,
		type: "Person",
		id: new URL(`https://${host}/federation/users/${user.id}`),

		name: user.username,
		preferredUsername: user.id,
		summary: user.bio,
		icon: user.avatar
			? [
					new URL(
						`${Config.get().cdn.endpointPublic}/avatars/${
							user.id
						}/${user.avatar}`,
					),
			  ]
			: undefined,

		inbox: new URL(`https://${host}/federation/users/${user.id}/inbox`),
		outbox: new URL(`https://${host}/federation/users/${user.id}/outbox`),
		followers: new URL(
			`https://${host}/federation/users/${user.id}/followers`,
		),
		publicKey: {
			id: `https://${host}/federation/users/${user.id}#main-key`,
			owner: `https://${host}/federation/users/${user.id}`,
			publicKeyPem: keys.publicKey,
		},
	};
};

// TODO: this was copied from previous implementation. refactor.
export const transformPersonToUser = async (person: AP.Person) => {
	if (!person.id) throw new APError("User must have ID");

	const url = new URL(person.id.toString());
	const email = `${url.pathname.split("/").reverse()[0]}@${url.hostname}`;

	const cachedKeys = await FederationKey.findOne({
		where: { federatedId: url.toString() },
	});
	if (cachedKeys) {
		return await User.findOneOrFail({ where: { id: cachedKeys.actorId } });
	}

	await FederationKey.create({
		actorId: Snowflake.generate(),
		federatedId: url.toString(),
		domain: url.hostname,
		publicKey: person.publicKey?.publicKeyPem,
		type: ActorType.USER,
	}).save();

	return User.create({
		username: person.preferredUsername,
		discriminator: url.hostname,
		bio: new TurndownService().turndown(person.summary),
		email,
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
	}).save();
};
