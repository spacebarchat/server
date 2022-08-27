import { Payload, WebSocket } from "@fosscord/gateway";
import {
	Application,
	checkToken,
	Config,
	ConnectedAccount,
	emitEvent,
	EVENTEnum,
	IdentifySchema,
	Intents,
	Member,
	MemberPrivateProjection,
	OrmUtils,
	PresenceUpdateEvent,
	PrivateSessionProjection,
	PrivateUserProjection,
	PublicMember,
	PublicUser,
	ReadState,
	ReadyEventData,
	Recipient,
	Session,
	SessionsReplace,
	User,
	UserSettings
} from "@fosscord/util";
import { setupListener } from "../listener/listener";
import { CLOSECODES, OPCODES } from "../util/Constants";
import { Send } from "../util/Send";
import { genSessionId } from "../util/SessionUtils";
import { check } from "./instanceOf";
// import experiments from "./experiments.json";
const experiments: any = [];

// TODO: user sharding
// TODO: check privileged intents, if defined in the config
// TODO: check if already identified

export async function onIdentify(this: WebSocket, data: Payload) {
	clearTimeout(this.readyTimeout);
	check.call(this, IdentifySchema, data.d);

	const identify: IdentifySchema = data.d;

	try {
		const { jwtSecret } = Config.get().security;
		var { decoded } = await checkToken(identify.token, jwtSecret); // will throw an error if invalid
	} catch (error) {
		console.error("invalid token", error);
		return this.close(CLOSECODES.Authentication_failed);
	}
	this.user_id = decoded.id;

	const session_id = genSessionId();
	this.session_id = session_id; //Set the session of the WebSocket object

	const [user, read_states, members, recipients, session, application, connected_accounts] = await Promise.all([
		User.findOneOrFail({
			where: { id: this.user_id },
			relations: ["relationships", "relationships.to", "settings"],
			select: [...PrivateUserProjection, "relationships"]
		}),
		ReadState.find({ where: { user_id: this.user_id } }),
		Member.find({
			where: { id: this.user_id },
			select: MemberPrivateProjection,
			relations: ["guild", "guild.channels", "guild.emojis", "guild.emojis.user", "guild.roles", "guild.stickers", "user", "roles"]
		}),
		Recipient.find({
			where: { user_id: this.user_id, closed: false },
			relations: ["channel", "channel.recipients", "channel.recipients.user"]
			// TODO: public user selection
		}),
		// save the session and delete it when the websocket is closed
		await OrmUtils.mergeDeep(new Session(), {
			user_id: this.user_id,
			session_id: session_id,
			// TODO: check if status is only one of: online, dnd, offline, idle
			status: identify.presence?.status || "offline", //does the session always start as online?
			client_info: {
				//TODO read from identity
				client: "desktop",
				os: identify.properties?.os,
				version: 0
			},
			activities: []
		}).save(),
		Application.findOne({ where: { id: this.user_id } }),
		ConnectedAccount.find({ where: { user_id: this.user_id } })
	]);

	if (!user) return this.close(CLOSECODES.Authentication_failed);
	if (!user.settings) {
		//settings may not exist after updating...
		user.settings = new UserSettings();
		user.settings.id = user.id;
		//await (user.settings as UserSettings).save();
	}

	if (!identify.intents) identify.intents = "30064771071";
	this.intents = new Intents(identify.intents);
	if (identify.shard) {
		this.shard_id = identify.shard[0];
		this.shard_count = identify.shard[1];
		if (
			this.shard_count == null ||
			this.shard_id == null ||
			this.shard_id >= this.shard_count ||
			this.shard_id < 0 ||
			this.shard_count <= 0
		) {
			console.log(identify.shard);
			return this.close(CLOSECODES.Invalid_shard);
		}
	}
	let users: PublicUser[] = [];

	const merged_members = members.map((x: Member) => {
		return [
			{
				...x,
				roles: x.roles.map((x) => x.id),
				settings: undefined,
				guild: undefined
			}
		];
	}) as PublicMember[][];
	let guilds = members.map((x) => ({ ...x.guild, joined_at: x.joined_at }));

	// @ts-ignore
	guilds = guilds.map((guild) => {
		if (user.bot) {
			setTimeout(() => {
				Send(this, {
					op: OPCODES.Dispatch,
					t: EVENTEnum.GuildCreate,
					s: this.sequence++,
					d: guild
				});
			}, 500);
			return { id: guild.id, unavailable: true };
		}

		return guild;
	});

	const user_guild_settings_entries = members.map((x) => x.settings);

	const channels = recipients.map((x) => {
		// @ts-ignore
		x.channel.recipients = x.channel.recipients?.map((x) => x.user);
		//TODO is this needed? check if users in group dm that are not friends are sent in the READY event
		users = users.concat(x.channel.recipients as unknown as User[]);
		if (x.channel.isDm()) {
			x.channel.recipients = x.channel.recipients!.filter((x) => x.id !== this.user_id);
		}
		return x.channel;
	});

	for (let relation of user.relationships) {
		const related_user = relation.to;
		const public_related_user = {
			username: related_user.username,
			discriminator: related_user.discriminator,
			id: related_user.id,
			public_flags: related_user.public_flags,
			avatar: related_user.avatar,
			bot: related_user.bot,
			bio: related_user.bio,
			premium_since: user.premium_since
		};
		users.push(public_related_user);
	}

	setImmediate(async () => {
		// run in seperate "promise context" because ready payload is not dependent on those events
		emitEvent({
			event: "SESSIONS_REPLACE",
			user_id: this.user_id,
			data: await Session.find({
				where: { user_id: this.user_id },
				select: PrivateSessionProjection
			})
		} as SessionsReplace);
		emitEvent({
			event: "PRESENCE_UPDATE",
			user_id: this.user_id,
			data: {
				user: await User.getPublicUser(this.user_id),
				activities: session.activities,
				client_status: session?.client_info,
				status: session.status
			}
		} as PresenceUpdateEvent);
	});

	read_states.forEach((s: any) => {
		s.id = s.channel_id;
		delete s.user_id;
		delete s.channel_id;
	});

	const privateUser = {
		avatar: user.avatar,
		mobile: user.mobile,
		desktop: user.desktop,
		discriminator: user.discriminator,
		email: user.email,
		flags: user.flags,
		id: user.id,
		mfa_enabled: user.mfa_enabled,
		nsfw_allowed: user.nsfw_allowed,
		phone: user.phone,
		premium: user.premium,
		premium_type: user.premium_type,
		public_flags: user.public_flags,
		username: user.username,
		verified: user.verified,
		bot: user.bot,
		accent_color: user.accent_color || 0,
		banner: user.banner,
		bio: user.bio,
		premium_since: user.premium_since
	};

	const d: ReadyEventData = {
		v: 8,
		application: { id: application?.id ?? "", flags: application?.flags ?? 0 }, //TODO: check this code!
		user: privateUser,
		user_settings: user.settings,
		// @ts-ignore
		guilds: guilds.map((x) => {
			// @ts-ignore
			x.guild_hashes = {}; // @ts-ignore
			x.guild_scheduled_events = []; // @ts-ignore
			x.threads = [];
			return x;
		}),
		guild_experiments: [], // TODO
		geo_ordered_rtc_regions: [], // TODO
		relationships: user.relationships.map((x) => x.toPublicRelationship()),
		read_state: {
			entries: read_states,
			partial: false,
			version: 304128
		},
		user_guild_settings: {
			entries: user_guild_settings_entries,
			partial: false, // TODO partial
			version: 642
		},
		private_channels: channels,
		session_id: session_id,
		analytics_token: "", // TODO
		connected_accounts,
		consents: {
			personalization: {
				consented: false // TODO
			}
		},
		country_code: user.settings.locale,
		friend_suggestion_count: 0, // TODO
		// @ts-ignore
		experiments: experiments, // TODO
		guild_join_requests: [], // TODO what is this?
		users: users.filter((x) => x).unique(),
		merged_members: merged_members
		// shard // TODO: only for user sharding
	};

	// TODO: send real proper data structure
	await Send(this, {
		op: OPCODES.Dispatch,
		t: EVENTEnum.Ready,
		s: this.sequence++,
		d
	});

	//TODO send READY_SUPPLEMENTAL
	//TODO send GUILD_MEMBER_LIST_UPDATE
	//TODO send SESSIONS_REPLACE
	//TODO send VOICE_STATE_UPDATE to let the client know if another device is already connected to a voice channel

	await setupListener.call(this);
}
