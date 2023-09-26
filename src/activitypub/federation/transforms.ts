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
import TurndownService from "turndown";
import { In } from "typeorm";
import {
	ACTIVITYSTREAMS_CONTEXT,
	APError,
	APObjectIsPerson,
	resolveAPObject,
} from "./utils";
import { APAnnounce, APGroup, APNote, APPerson } from "activitypub-types";

export const transformMessageToAnnounceNoce = async (
	message: Message,
): Promise<APAnnounce> => {
	const { host } = Config.get().federation;

	const channel = await Channel.findOneOrFail({
		where: { id: message.channel_id },
		relations: {
			recipients: true,
		},
	});

	let to = [
		`https://${host}/federation/channels/${message.channel_id}/followers`,
	];

	if (channel.isDm()) {
		const otherUsers = channel.recipients?.filter(
			(x) => x.user_id != message.author_id,
		);
		if (!otherUsers) throw new APError("this dm channel has no recipients");
		const remoteUsersKeys = await FederationKey.find({
			where: { actorId: In(otherUsers?.map((x) => x.user_id)) },
		});

		to = remoteUsersKeys.map((x) =>
			x.inbox ? x.inbox! : `${x.federatedId}/inbox`,
		);
	}

	return {
		"@context": ACTIVITYSTREAMS_CONTEXT,
		type: "Announce",
		id: `https://${host}/federation/channels/${message.channel_id}/messages/${message.id}`,
		// this is wrong for remote users
		actor: `https://${host}/federation/users/${message.author_id}`,
		published: message.timestamp,
		to,
		object: await transformMessageToNote(message),
	} as APAnnounce;
};

export const transformMessageToNote = async (
	message: Message,
): Promise<APNote> => {
	const { host } = Config.get().federation;

	const referencedMessage = message.message_reference
		? await Message.findOne({
				where: { id: message.message_reference.message_id },
		  })
		: null;

	return {
		id: `https://${host}/federation/messages/${message.id}`,
		type: "Note",
		content: message.content, // TODO: convert markdown to html
		inReplyTo: referencedMessage
			? await transformMessageToNote(referencedMessage)
			: undefined,
		published: message.timestamp,
		attributedTo: `https://${host}/federation/users/${message.author_id}`,

		to: [`https://${host}/federation/channels/${message.channel_id}`],
		tag: message.mentions?.map(
			(x) => `https://${host}/federation/users/${x.id}`,
		),
		attachment: [],
		// replies: [],
		// sbType: message.type,
		// embeds: [],
		// flags: message.flags,
	};
};

// TODO: this was copied from the previous implemention. refactor it.
export const transformNoteToMessage = async (note: APNote) => {
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
): Promise<APGroup> => {
	const { host, accountDomain } = Config.get().federation;

	const keys = await FederationKey.findOneOrFail({
		where: { actorId: channel.id, domain: accountDomain },
	});

	return {
		"@context": "https://www.w3.org/ns/activitystreams",
		type: "Group",
		id: `https://${host}/fed/channels/${channel.id}`,
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

		inbox: `https://${host}/fed/channels/${channel.id}/inbox`,
		outbox: `https://${host}/fed/channels/${channel.id}/outbox`,
		followers: `https://${host}/fed/channels/${channel.id}/followers`,
	};
};

export const transformUserToPerson = async (user: User): Promise<APPerson> => {
	const { host, accountDomain } = Config.get().federation;

	const keys = await FederationKey.findOneOrFail({
		where: { actorId: user.id, domain: accountDomain },
	});

	return {
		"@context": ACTIVITYSTREAMS_CONTEXT,
		type: "Person",
		id: `https://${host}/federation/users/${user.id}`,

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

		inbox: `https://${host}/federation/users/${user.id}/inbox`,
		outbox: `https://${host}/federation/users/${user.id}/outbox`,
		followers: `https://${host}/federation/users/${user.id}/followers`,
		publicKey: {
			id: `https://${host}/federation/users/${user.id}#main-key`,
			owner: `https://${host}/federation/users/${user.id}`,
			publicKeyPem: keys.publicKey,
		},
	};
};

// TODO: this was copied from previous implementation. refactor.
export const transformPersonToUser = async (person: APPerson) => {
	if (!person.id) throw new APError("User must have ID");

	const url = new URL(person.id.toString());
	const email = `${url.pathname.split("/").reverse()[0]}@${url.hostname}`;

	const cachedKeys = await FederationKey.findOne({
		where: { federatedId: url.toString() },
	});
	if (cachedKeys) {
		return await User.findOneOrFail({ where: { id: cachedKeys.actorId } });
	}

	const keys = await FederationKey.create({
		actorId: Snowflake.generate(),
		federatedId: url.toString(),
		domain: url.hostname,
		publicKey: person.publicKey?.publicKeyPem,
		type: ActorType.USER,
		inbox: person.inbox.toString(),
		outbox: person.outbox.toString(),
	}).save();

	return await User.create({
		id: keys.actorId,
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
