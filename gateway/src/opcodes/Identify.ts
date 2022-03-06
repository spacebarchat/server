import { WebSocket, Payload } from "@fosscord/gateway";
import {
	checkToken,
	Intents,
	Member,
	ReadyEventData,
	User,
	Session,
    Role,
	EVENTEnum,
	Config,
	PublicMember,
	PublicUser,
	PrivateUserProjection,
	ReadState,
	Application,
	emitEvent,
	SessionsReplace,
	PrivateSessionProjection,
	MemberPrivateProjection,
	PresenceUpdateEvent,
	Sorting
} from "@fosscord/util";
import { Send } from "../util/Send";
/*import { Sorting } from "../util/Sorting";*/
import { CLOSECODES, OPCODES } from "../util/Constants";
import { genSessionId } from "../util/SessionUtils";
import { setupListener } from "../listener/listener";
import { IdentifySchema } from "../schema/Identify";
// import experiments from "./experiments.json";
const experiments: any = [];
import { check } from "./instanceOf";
import { Recipient } from "@fosscord/util";
import "missing-native-js-functions";
import { getRepository } from "typeorm";

// TODO: bot sharding
// TODO: check priviliged intents
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
	const member_before = await Member.findOne({
        where: { id: this.user_id},
        relations: ["user", "roles", "guild", "guild.channels", "guild.roles", "guild.members"],
    });
    let items_before = [] as any[];
    let groups_before = [] as any[];
    if(typeof member_before !== "undefined"){
        const guild_roles_b = await Role.find({
            where: { guild_id: member_before.guild_id },
            select: ["id"],
            order: {position: "DESC"},
        });
        let guild_members_before = await getRepository(Member)
                .createQueryBuilder("member")
                .where("member.guild_id = :guild_id", { guild_id: member_before.guild_id })
                .leftJoinAndSelect("member.roles", "role")
                .leftJoinAndSelect("member.user", "user")
                .leftJoinAndSelect("user.sessions", "session")
                .addSelect(
                    "CASE WHEN session.status = 'offline' THEN 0 ELSE 1 END",
                    "_status"
                    )
                .orderBy("role.position", "DESC")
                .addOrderBy("_status", "DESC")
                .addOrderBy("user.username", "ASC")
                .getMany();
        let sorted = await Sorting(member_before, guild_roles_b,guild_members_before);

        items_before = sorted.items;
        groups_before = sorted.groups;
    }
	const session_id = genSessionId();
	this.session_id = session_id; //Set the session of the WebSocket object

	const [user, read_states, members, recipients, session, application] =
		await Promise.all([
			User.findOneOrFail({
				where: { id: this.user_id },
				relations: ["relationships", "relationships.to"],
				select: [...PrivateUserProjection, "relationships"],
			}),
			ReadState.find({ user_id: this.user_id }),
			Member.find({
				where: { id: this.user_id },
				select: MemberPrivateProjection,
				relations: [
					"guild",
                    "guild.members",
					"guild.channels",
					"guild.emojis",
					"guild.emojis.user",
					"guild.roles",
					"guild.stickers",
					"user",
					"roles",
				],
			}),
			Recipient.find({
				where: { user_id: this.user_id, closed: false },
				relations: [
					"channel",
					"channel.recipients",
					"channel.recipients.user",
				],
				// TODO: public user selection
			}),
			// save the session and delete it when the websocket is closed
			new Session({
				user_id: this.user_id,
				session_id: session_id,
				// TODO: check if status is only one of: online, dnd, offline, idle
				status: identify.presence?.status || "online", //does the session always start as online?
				client_info: {
					//TODO read from identity
					client: "desktop",
					os: identify.properties?.os,
					version: 0,
                    status: identify.presence?.status,
                    desktop: identify.presence?.status,
				},
				activities: [],
			}).save(),
			Application.findOne({ id: this.user_id }),
		]);

	if (!user) return this.close(CLOSECODES.Authentication_failed);

	if (!identify.intents) identify.intents = BigInt("0b11111111111111");
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
				guild: undefined,
			},
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
					d: guild,
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
			x.channel.recipients = x.channel.recipients!.filter(
				(x) => x.id !== this.user_id
			);
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
				select: PrivateSessionProjection,
			}),
		} as SessionsReplace);

        for( const member of members){
            
            emitEvent({
                event: "PRESENCE_UPDATE",
                guild_id: member.guild_id,
                data: {
                    guild_id: member.guild_id,
                    user: await User.getPublicUser(this.user_id),
                    activities: session.activities,
                    client_status: session?.client_info,
                    status: session.status,
                },
            } as PresenceUpdateEvent);
            if(typeof member_before !== "undefined"){
                let guild_members = await getRepository(Member)
                    .createQueryBuilder("member")
                    .where("member.guild_id = :guild_id", { guild_id: member.guild_id })
                    .leftJoinAndSelect("member.roles", "role")
                    .leftJoinAndSelect("member.user", "user")
                    .leftJoinAndSelect("user.sessions", "session")
                    .addSelect(
                        "CASE WHEN session.status = 'offline' THEN 0 ELSE 1 END",
                        "_status"
                    )
                    .orderBy("role.position", "DESC")
                    .addOrderBy("_status", "DESC")
                    .addOrderBy("user.username", "ASC")
                    .getMany();
                        
                const guild_roles = await Role.find({
                    where: { guild_id: member.guild_id },
                    select: ["id"],
                    order: {position: "DESC"},
                });
            //     const guild_members = await Member.find({
            //         where: { guild_id: member.guild_id },
            //         relations: ["roles", "user"],
            //     });
                let sorted = await Sorting(member, guild_roles,guild_members);
                let total_online = sorted.total_online;
                let items = [] as any[];
                let groups = [] as any[];
                items = sorted.items;
                groups = sorted.groups;
                
                let gmluser_group = groups;
                let gml_index = items.map(object => object.member? object.member.id : false).indexOf(this.user_id);
                
                const role = member.roles.first() || {id: member.guild_id};
                let index_online = items_before.map(object => object.member? object.member.id : false).indexOf(this.user_id);
                let contains_group = items_before.map(object => object.group? object.group.id : false).indexOf(role.id === member.guild_id ? "online" : role.id);
                let contains_group_new = items.map(object => object.group? object.group.id : false).indexOf(role.id === member.guild_id ? "online" : role.id);
                
                let ops = [];
                ops.push({
                    op: "DELETE",
                    index: index_online//DELETE USER FROM GROUP
                });
                if(contains_group_new == -1){
                    ops.push({
                        op: "DELETE", // DELETE group
                        index: contains_group,
                    });
                }
                if(contains_group == -1){
                    ops.push({
                        op: "INSERT", // INSERT new group, if not existing
                        item: {
                            group: {
                                id: role.id,
                                count: 1
                            }
                        },
                        index: contains_group_new,
                    });
                }
                ops.push({
                    op: "INSERT", // INSERT USER INTO GROUP, PROBABLY ISSUE WITH INDEX NUM WOULD NEED TO FIGURE THIS OUT.
                    item:{
                        member: {
                            user: {
                                username: member.user.username,
                                id: member.user.id,
                                discriminator: member.user.discriminator,
                                avatar: member.user.avatar,
                                },
                            roles: [role.id],
                            presence: {
                                user: {
                                    id: member.user.id,
                                },
                                status: session?.status,
                                client_status: {web: session?.status}, // TODO:
                                activities: [],
                            },
                            premium_since: member.premium_since,
                            pending: false,
                            nick: null,
                            mute: false,
                            joined_at: member.joined_at,
                            hoisted_role: null,
                            deaf: false,
                            communication_disabled_until: null,
                            avatar: null

                        }
                    },
                    index: contains_group == -1 && role.id === member.guild_id ? contains_group_new:gml_index,
                });
            

            
                await emitEvent({
                    event: "GUILD_MEMBER_LIST_UPDATE",
                    guild_id: member.guild_id,
                    data: {
                        online_count: total_online,
                        member_count: member.guild.member_count,
                        guild_id: member.guild_id,
                        id: "everyone",
                        groups: groups,
                        ops: ops
                    },
                });
            }

        }
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
		application,
		user: privateUser,
		user_settings: user.settings,
		// @ts-ignore
		guilds: guilds.map((x) => {
			// @ts-ignore
			x.guild_hashes = {}; // @ts-ignore
			x.guild_scheduled_events = []; // @ts-ignore
			x.threads = [];
			x.premium_subscription_count = 30;
			x.premium_tier = 3;
			return x;
		}),
		guild_experiments: [], // TODO
		geo_ordered_rtc_regions: [], // TODO
		relationships: user.relationships.map((x) => x.toPublicRelationship()),
		read_state: {
			entries: read_states,
			partial: false,
			version: 304128,
		},
		user_guild_settings: {
			entries: user_guild_settings_entries,
			partial: false, // TODO partial
			version: 642,
		},
		private_channels: channels,
		session_id: session_id,
		analytics_token: "", // TODO
		connected_accounts: [], // TODO
		consents: {
			personalization: {
				consented: false, // TODO
			},
		},
		country_code: user.settings.locale,
		friend_suggestion_count: 0, // TODO
		// @ts-ignore
		experiments: experiments, // TODO
		guild_join_requests: [], // TODO what is this?
		users: users.filter((x) => x).unique(),
		merged_members: merged_members,
		// shard // TODO: only for bots sharding
	};

	// TODO: send real proper data structure
	await Send(this, {
		op: OPCODES.Dispatch,
		t: EVENTEnum.Ready,
		s: this.sequence++,
		d,
	});

	//TODO send READY_SUPPLEMENTAL
	//TODO send GUILD_MEMBER_LIST_UPDATE
	//TODO send SESSIONS_REPLACE
	//TODO send VOICE_STATE_UPDATE to let the client know if another device is already connected to a voice channel

	await setupListener.call(this);
}
function partition<T>(array: T[], isValid: Function) {
	// @ts-ignore
	return array.reduce(
		// @ts-ignore
		([pass, fail], elem) => {
			return isValid(elem)
				? [[...pass, elem], fail]
				: [pass, [...fail, elem]];
		},
		[[], []]
	);
}
