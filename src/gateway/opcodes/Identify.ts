/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Capabilities, CLOSECODES, OPCODES, Payload, Send, setupListener, WebSocket } from "@spacebar/gateway";
import {
    Application,
    Channel,
    checkToken,
    Config,
    CurrentTokenFormatVersion,
    ElapsedTime,
    emitEvent,
    Emoji,
    EVENTEnum,
    generateToken,
    getDatabase,
    Guild,
    GuildOrUnavailable,
    Intents,
    Member,
    MemberPrivateProjection,
    OPCodes,
    PresenceUpdateEvent,
    ReadState,
    ReadyEventData,
    ReadyGuildDTO,
    ReadyUserGuildSettingsEntries,
    Recipient,
    Relationship,
    Role,
    Session,
    SessionsReplace,
    Sticker,
    Stopwatch,
    timeFunction,
    timePromise,
    TraceNode,
    TraceRoot,
    UserSettings,
    UserSettingsProtos,
    VoiceState,
} from "@spacebar/util";
import { check } from "./instanceOf";
import { In, Not } from "typeorm";
import { PreloadedUserSettings } from "discord-protos";
import { ChannelType, DefaultUserGuildSettings, DMChannel, IdentifySchema, PrivateUserProjection, PublicUser, PublicUserProjection } from "@spacebar/schemas";

// TODO: user sharding
// TODO: check privileged intents, if defined in the config

function logAuth(message: string) {
    if (process.env.LOG_AUTH != "true") return;
    console.log(`[Gateway/Auth] ${message}`);
}

export async function onIdentify(this: WebSocket, data: Payload) {
    const totalSw = Stopwatch.startNew();
    const taskSw = Stopwatch.startNew();
    const gatewayShardName = `sb-gateway`;

    if (this.user_id) {
        // we've already identified
        return this.close(CLOSECODES.Already_authenticated);
    }

    clearTimeout(this.readyTimeout);

    // Check payload matches schema
    check.call(this, IdentifySchema, data.d);
    const identify: IdentifySchema = data.d;

    this.capabilities = new Capabilities(identify.capabilities || 0);
    this.large_threshold = identify.large_threshold || 250;
    const parseAndValidateTime = taskSw.getElapsedAndReset();

    const { result: tokenData, elapsed: checkTokenTime } = await timePromise(() =>
        checkToken(identify.token, {
            // relations: {"relationships", "relationships.to", "settings"],
            // select: [...PrivateUserProjection, "relationships", "rights"],
            select: [...PrivateUserProjection, "rights"],
        }),
    );

    this.accessToken = identify.token;

    taskSw.reset(); // don't include checkToken time...

    const user = tokenData.user;
    if (!user) {
        console.log("[Gateway] Failed to identify user");
        return this.close(CLOSECODES.Authentication_failed);
    }

    this.user_id = user.id;
    this.session = tokenData.session;
    const userQueryTime = taskSw.getElapsedAndReset();

    // Check intents
    if (!identify.intents) identify.intents = 0b11011111111111111111111111111111111n; // TODO: what is this number?
    this.intents = new Intents(identify.intents);

    // TODO: actually do intent things.

    // Validate sharding
    if (identify.shard) {
        this.shard_id = identify.shard[0];
        this.shard_count = identify.shard[1];

        if (this.shard_count == null || this.shard_id == null || this.shard_id > this.shard_count || this.shard_id < 0 || this.shard_count <= 0) {
            // TODO: why do we even care about this right now?
            console.log(`[Gateway] Invalid sharding from ${user.id}: ${identify.shard}`);
            return this.close(CLOSECODES.Invalid_shard);
        }
    }
    const validateIntentsAndShardingTime = taskSw.getElapsedAndReset();

    // Generate a new gateway session if needed (id is already made, just save it in db )
    const { session, isNewSession } = tokenData.session
        ? { session: tokenData.session, isNewSession: false }
        : {
              session: Session.create({
                  user_id: this.user_id,
                  session_id: this.session_id,
              }),
              isNewSession: true,
          };

    this.session = session;
    this.session.status = identify.presence?.status || "online";
    this.session.last_seen = new Date();
    this.session.client_info ??= {};
    this.session.client_info.platform = identify.properties?.$device ?? identify.properties?.$device;
    this.session.client_info.os = identify.properties?.os || identify.properties?.$os;
    this.session.client_status = {};
    this.session.activities = identify.presence?.activities ?? []; // TODO: validation

    if (this.ipAddress && this.ipAddress !== this.session.last_seen_ip) {
        this.session.last_seen_ip = this.ipAddress;
        await this.session.updateIpInfo();
    }

    const createSessionTime = taskSw.getElapsedAndReset();

    // Get from database:
    // * the users read states
    // * guild members for this user
    // * recipients ( dm channels )
    // * the bot application, if it exists
    const [
        { elapsed: sessionSaveTime },
        { result: sessions, elapsed: sessionQueryTime },
        { result: relationships, elapsed: relationshipQueryTime },
        { result: settings, elapsed: settingsQueryTime },
        { result: settingsProtos, elapsed: settingsProtosQueryTime },
        { result: application, elapsed: applicationQueryTime },
        { result: read_states, elapsed: read_statesQueryTime },
        { result: members, elapsed: membersQueryTime },
        { result: recipients, elapsed: recipientsQueryTime },
    ] = await Promise.all([
        // avoid a round trip to check if it exists...
        timePromise(() => (isNewSession ? Session.insert(session) : Session.update({ session_id: session.session_id }, session)) as Promise<unknown>),
        timePromise(() =>
            Session.find({
                where: { user_id: this.user_id, is_admin_session: false, session_id: Not(this.session_id) },
            }),
        ),
        timePromise(() =>
            Relationship.find({
                where: { from_id: this.user_id },
                relations: { to: true },
            }),
        ),
        timePromise(() => UserSettings.getOrDefault(this.user_id)),
        timePromise(() =>
            UserSettingsProtos.findOne({
                where: { user_id: this.user_id },
            }),
        ),
        timePromise(() =>
            Application.findOne({
                where: { id: this.user_id },
                select: { id: true, flags: true },
            }),
        ),
        timePromise(() =>
            ReadState.find({
                where: { user_id: this.user_id },
                select: { id: true, channel_id: true, last_message_id: true, last_pin_timestamp: true, mention_count: true },
            }),
        ),
        timePromise(() =>
            Member.find({
                where: { id: this.user_id },
                select: {
                    // We only want some member props
                    ...Object.fromEntries(MemberPrivateProjection.map((x) => [x, true])),
                    settings: true, // guild settings
                    roles: { id: true }, // the full role is fetched from the `guild` relation
                    guild: { id: true },

                    // TODO: we don't really need every property of
                    // guild channels, emoji, roles, stickers
                    // but we do want almost everything from guild.
                    // How do you do that without just enumerating the guild props?
                    // guild: Object.fromEntries(
                    // 	getDatabase()!
                    // 		.getMetadata(Guild)
                    // 		.columns.map((x) => [x.propertyName, true]),
                    // ),
                },
                relations: {
                    // "guild",
                    // "guild.channels",
                    // "guild.emojis",
                    // "guild.roles",
                    // "guild.stickers",
                    // "guild.voice_states",
                    roles: true,

                    // For these entities, `user` is always just the logged in user we fetched above
                    // "user",
                },
            }),
        ),
        timePromise(() =>
            Recipient.find({
                where: { user_id: this.user_id, closed: false },
                relations: { channel: { recipients: { user: true } } },
                select: {
                    channel: {
                        id: true,
                        flags: true,
                        // is_spam: true,	// TODO
                        last_message_id: true,
                        last_pin_timestamp: true,
                        type: true,
                        icon: true,
                        name: true,
                        owner_id: true,
                        recipients: {
                            // we don't actually need this ID or any other information about the recipient info,
                            // but typeorm does not select anything from the users relation of recipients unless we select
                            // at least one column.
                            id: true,
                            // We only want public user data for each dm channel
                            user: Object.fromEntries(PublicUserProjection.map((x) => [x, true])),
                        },
                    },
                },
            }),
        ),
    ]);

    user.relationships = relationships;
    user.settings = settings;

    const userMetaQueryTime = taskSw.getElapsedAndReset();

    const { result: memberGuilds, elapsed: queryGuildsTime } = await timePromise(() =>
        Promise.all(
            members.map((m) =>
                Guild.findOneOrFail({
                    where: { id: m.guild_id },
                    select: Object.fromEntries(
                        getDatabase()!
                            .getMetadata(Guild)
                            .columns.map((x) => [x.propertyName, true]),
                    ),
                }),
            ),
        ),
    );

    const guildIds = memberGuilds.map((g) => g.id);

    // select relations
    const [
        { result: memberGuildChannels, elapsed: queryGuildChannelsTime },
        { result: memberGuildEmojis, elapsed: queryGuildEmojisTime },
        { result: memberGuildRoles, elapsed: queryGuildRolesTime },
        { result: memberGuildStickers, elapsed: queryGuildStickersTime },
        { result: memberGuildVoiceStates, elapsed: queryGuildVoiceStatesTime },
    ] = await Promise.all([
        timePromise(() =>
            Channel.find({
                where: {
                    guild_id: In(guildIds),
                    type: Not(ChannelType.GUILD_PUBLIC_THREAD),
                },
                order: { guild_id: "ASC" },
            }),
        ),
        timePromise(() =>
            Emoji.find({
                where: { guild_id: In(guildIds) },
                order: { guild_id: "ASC" },
            }),
        ),
        timePromise(() =>
            Role.find({
                where: { guild_id: In(guildIds) },
                order: { guild_id: "ASC" },
            }),
        ),
        timePromise(() =>
            Sticker.find({
                where: { guild_id: In(guildIds) },
                order: { guild_id: "ASC" },
            }),
        ),
        timePromise(() =>
            VoiceState.find({
                where: { guild_id: In(guildIds) },
                order: { guild_id: "ASC" },
            }),
        ),
    ]);

    const mergeMemberGuildsTrace: TraceNode = {
        micros: 0,
        calls: [],
    };
    members.forEach((m) => {
        const sw = Stopwatch.startNew();
        const totalSw = Stopwatch.startNew();
        const trace: TraceNode = {
            micros: 0,
            calls: [],
        };

        const g = memberGuilds.find((mg) => mg.id === m.guild_id);
        if (g) {
            m.guild = g;
            trace.calls.push("findGuild", { micros: sw.getElapsedAndReset().totalMicroseconds });

            //channels
            g.channels = memberGuildChannels.filter((c) => c.guild_id === m.guild_id);
            trace.calls.push("filterChannels", { micros: sw.getElapsedAndReset().totalMicroseconds });

            //emojis
            g.emojis = memberGuildEmojis.filter((e) => e.guild_id === m.guild_id);
            trace.calls.push("filterEmojis", { micros: sw.getElapsedAndReset().totalMicroseconds });

            //roles
            g.roles = memberGuildRoles.filter((r) => r.guild_id === m.guild_id);
            trace.calls.push("filterRoles", { micros: sw.getElapsedAndReset().totalMicroseconds });

            //stickers
            g.stickers = memberGuildStickers.filter((s) => s.guild_id === m.guild_id);
            trace.calls.push("filterStickers", { micros: sw.getElapsedAndReset().totalMicroseconds });

            //voice states
            g.voice_states = memberGuildVoiceStates.filter((v) => v.guild_id === m.guild_id);
            trace.calls.push("filterVoiceStates", { micros: sw.getElapsedAndReset().totalMicroseconds });

            //total
            trace.micros = totalSw.elapsed().totalMicroseconds;
            mergeMemberGuildsTrace.calls!.push(`guild_${m.guild_id}`, trace);
        } else {
            console.error(`[Gateway] Member ${m.id} has invalid guild_id ${m.guild_id}`);
            mergeMemberGuildsTrace.calls!.push(`guild_~~${m.guild_id}~~`, trace);
        }
    });

    for (const call of mergeMemberGuildsTrace.calls!) {
        if (typeof call !== "string") mergeMemberGuildsTrace.micros += (call as { micros: number }).micros;
    }

    const guildRelationQueryTime = taskSw.getElapsedAndReset();

    // We forgot to migrate user settings from the JSON column of `users`
    // to the `user_settings` table theyre in now,
    // so for instances that migrated, users may not have a `user_settings` row.
    let createUserSettingsTime: ElapsedTime | undefined = undefined;
    if (!user.settings) {
        user.settings = await UserSettings.getOrDefault(user.id);
        createUserSettingsTime = taskSw.getElapsedAndReset();
    }

    // Generate merged_members
    const merged_members = members.map((x) => {
        return [
            {
                ...x,
                // filter out @everyone role
                roles: x.roles.filter((r) => r.id !== x.guild.id).map((x) => x.id),

                // add back user, which we don't fetch from db
                // TODO: For guild profiles, this may need to be changed.
                // TODO: The only field required in the user prop is `id`,
                // but our types are annoying so I didn't bother.
                user: user.toPublicUser(),

                guild: {
                    id: x.guild.id,
                },
                settings: undefined,
            },
        ];
    });
    const mergedMembersTime = taskSw.getElapsedAndReset();

    // Populated with guilds 'unavailable' currently
    // Just for bots
    const pending_guilds: Guild[] = [];

    // Generate guilds list ( make them unavailable if user is bot )
    const guilds: GuildOrUnavailable[] = members.map((member) => {
        member.guild.channels = member.guild.channels
            /*
   			//TODO maybe implement this correctly, by causing create and delete events for users who can newly view and not view the channels, along with doing these checks correctly, as they don't currently take into account that the owner of the guild is always able to view channels, with potentially other issues
   			.filter((channel) => {
				const perms = Permissions.finalPermission({
					user: {
						id: member.id,
						roles: member.roles.map((x) => x.id),
					},
					guild: member.guild,
					channel,
				});

				return perms.has("VIEW_CHANNEL");
			})
   			*/
            .map((channel) => {
                channel.position = member.guild.channel_ordering.indexOf(channel.id);
                return channel;
            })
            .sort((a, b) => a.position - b.position);

        if (user.bot) {
            pending_guilds.push(member.guild);
            return { id: member.guild.id, unavailable: true };
        }

        return {
            ...member.guild.toJSON(),
            joined_at: member.joined_at,

            threads: member.guild.channels.filter((x) => x.isThread()),
        };
    });
    const generateGuildsListTime = taskSw.getElapsedAndReset();

    // Generate user_guild_settings
    const user_guild_settings_entries: ReadyUserGuildSettingsEntries[] = members.map((x) => ({
        ...DefaultUserGuildSettings,
        ...x.settings,
        guild_id: x.guild_id,
        channel_overrides: Object.entries(x.settings.channel_overrides ?? {}).map((y) => ({
            ...y[1],
            channel_id: y[0],
        })),
    }));
    const generateUserGuildSettingsTime = taskSw.getElapsedAndReset();

    // Populated with users from private channels, relationships.
    // Uses a set to dedupe for us.
    const users: Set<PublicUser> = new Set();

    // Generate dm channels from recipients list. Append recipients to `users` list
    const channels = recipients
        .filter(({ channel }) => channel.isDm())
        .map((r) => {
            // TODO: fix the types of Recipient
            // Their channels are only ever private (I think) and thus are always DM channels
            const channel = r.channel as DMChannel;

            // Remove ourself from the list of other users in dm channel
            channel.recipients = channel.recipients.filter((recipient) => recipient.user.id !== this.user_id);

            let channelUsers = channel.recipients?.map((recipient) => recipient.user.toPublicUser());

            if (channelUsers && channelUsers.length > 0) channelUsers.forEach((user) => users.add(user));
            // HACK: insert self into recipients for DMs with users that no longer exist
            else if (channel.type === ChannelType.DM) {
                const selfUser = user.toPublicUser();
                users.add(selfUser);
                channelUsers ??= [];
                channelUsers.push(selfUser);
            }

            return {
                id: channel.id,
                flags: channel.flags,
                last_message_id: channel.last_message_id,
                type: channel.type,
                recipients: channelUsers || [],
                icon: channel.icon,
                name: channel.name,
                is_spam: false, // TODO
                owner_id: channel.owner_id || undefined,
            };
        });
    const generateDmChannelsTime = taskSw.getElapsedAndReset();

    // From user relationships ( friends ), also append to `users` list
    user.relationships.forEach((x) => users.add(x.to.toPublicUser()));
    const appendRelationshipsTime = taskSw.getElapsedAndReset();

    // Send SESSIONS_REPLACE and PRESENCE_UPDATE
    const allSessions = sessions.concat(this.session!).map((x) => x.toPrivateGatewayDeviceInfo());
    const findAndGenerateSessionReplaceTime = taskSw.getElapsedAndReset();

    const [{ elapsed: emitSessionsReplaceTime }, { elapsed: emitPresenceUpdateTime }] = await Promise.all([
        timePromise(() =>
            emitEvent({
                event: "SESSIONS_REPLACE",
                user_id: this.user_id,
                data: allSessions,
            } as SessionsReplace),
        ),
        timePromise(() =>
            emitEvent({
                event: "PRESENCE_UPDATE",
                user_id: this.user_id,
                data: {
                    user: user.toPublicUser(),
                    activities: this.session!.activities,
                    client_status: this.session!.client_status,
                    status: this.session!.getPublicStatus(),
                },
            } as PresenceUpdateEvent),
        ),
    ]);

    taskSw.reset();
    // Build READY

    // const remapReadStateIdsTime = taskSw.getElapsedAndReset();
    const buildReadyTrace: TraceNode = {
        micros: 0,
        calls: [],
    };
    const { elapsed: remapReadStateIdsTime } = timeFunction(() =>
        read_states.forEach((x) => {
            x.id = x.channel_id;
        }),
    );
    buildReadyTrace.calls!.push("remapReadStateIds", { micros: remapReadStateIdsTime.totalMicroseconds });

    const { result: user_settings_proto, elapsed: serialiseUserSettingsProtoTime } = timeFunction(() =>
        settingsProtos?.userSettings ? PreloadedUserSettings.toBase64(settingsProtos.userSettings) : undefined,
    );
    buildReadyTrace.calls!.push("serializeUserSettingsProto", { micros: serialiseUserSettingsProtoTime.totalMicroseconds });

    const { result: user_settings_proto_json, elapsed: serialiseUserSettingsProtoJsonTime } = timeFunction(() =>
        settingsProtos?.userSettings ? PreloadedUserSettings.toJson(settingsProtos.userSettings) : undefined,
    );
    buildReadyTrace.calls!.push("serializeUserSettingsProtoJson", { micros: serialiseUserSettingsProtoJsonTime.totalMicroseconds });

    const { result: remappedGuilds, elapsed: remapGuildsTime } = timeFunction(() =>
        this.capabilities!.has(Capabilities.FLAGS.CLIENT_STATE_V2) ? guilds.map((x) => new ReadyGuildDTO(x).toJSON()) : guilds,
    );
    buildReadyTrace.calls!.push(this.capabilities!.has(Capabilities.FLAGS.CLIENT_STATE_V2) ? "remapGuilds" : "[NoOP] remapGuilds", { micros: remapGuildsTime.totalMicroseconds });

    const { result: remappedRelationships, elapsed: remapRelationshipsTime } = timeFunction(() => user.relationships.map((x) => x.toPublicRelationship()));
    buildReadyTrace.calls!.push("remapRelationships", { micros: remapRelationshipsTime.totalMicroseconds });

    buildReadyTrace.micros = buildReadyTrace.calls!.reduce((a, b) => {
        if (typeof b === "string") return a;
        return a + (b as { micros: number }).micros;
    }, 0);

    // const d: ReadyEventData = {
    const { result: d, elapsed: buildReadyEventDataTime } = timeFunction<ReadyEventData>(() => {
        return {
            v: 9,
            application: application ? { id: application.id, flags: application.flags } : undefined,
            user: user.toPrivateUser(["rights"]),
            user_settings: user.settings,
            user_settings_proto,
            user_settings_proto_json,
            guilds: remappedGuilds,
            relationships: remappedRelationships,
            read_state: {
                entries: read_states,
                partial: false,
                version: 0, // TODO
            },
            user_guild_settings: {
                entries: user_guild_settings_entries,
                partial: false,
                version: 0, // TODO
            },
            private_channels: channels,
            presences: [], // TODO: Send actual data
            session_id: this.session_id,
            country_code: user.settings!.locale, // TODO: do ip analysis instead
            users: Array.from(users),
            merged_members: merged_members,
            sessions: allSessions,

            resume_gateway_url: Config.get().gateway.endpointPublic!,

            // lol hack whatever
            required_action: Config.get().login.requireVerification && !user.verified ? "REQUIRE_VERIFIED_EMAIL" : undefined,

            consents: {
                personalization: {
                    consented: false, // TODO
                },
            },
            experiments: [],
            guild_join_requests: [],
            connected_accounts: [],
            guild_experiments: [],
            geo_ordered_rtc_regions: [],
            api_code_version: 1,
            friend_suggestion_count: 0,
            analytics_token: "",
            tutorial: null,
            session_type: "normal", // TODO
            auth_session_id_hash: this.session!.getDiscordDeviceInfo().id_hash,
            notification_settings: {
                // ????
                flags: 0,
            },
            game_relationships: [],
        } as ReadyEventData;
    });

    if (this.capabilities.has(Capabilities.FLAGS.AUTH_TOKEN_REFRESH) && tokenData.tokenVersion != CurrentTokenFormatVersion) {
        d.auth_token = this.accessToken = (await generateToken(this.user_id))!;
    }
    // const buildReadyEventDataTime = taskSw.getElapsedAndReset();

    const _trace = [
        gatewayShardName,
        {
            micros: totalSw.elapsed().totalMicroseconds,
            calls: [],
        },
    ] as TraceRoot;
    const times = {
        parseAndValidateTime,
        checkTokenTime,
        userQueryTime,
        validateIntentsAndShardingTime,
        createSessionTime,
        userMetaQueryTime,
        queryGuildsTime,
        guildRelationQueryTime,
        createUserSettingsTime,
        mergedMembersTime,
        generateGuildsListTime,
        generateUserGuildSettingsTime,
        generateDmChannelsTime,
        appendRelationshipsTime,
        findAndGenerateSessionReplaceTime,
        emitSessionsReplaceTime,
        emitPresenceUpdateTime,
        remapReadStateIdsTime,
        buildReadyEventDataTime,
    };
    for (const [key, value] of Object.entries(times)) {
        if (value) {
            const val = { micros: value.totalMicroseconds } as { micros: number; calls: TraceNode[] };
            _trace![1].calls.push(key, val);
            if (key === "userMetaQueryTime") {
                val.calls = [];
                for (const [subkey, subvalue] of Object.entries({
                    sessionSaveTime,
                    sessionQueryTime,
                    relationshipQueryTime,
                    settingsQueryTime,
                    settingsProtosQueryTime,
                    applicationQueryTime,
                    read_statesQueryTime,
                    membersQueryTime,
                    recipientsQueryTime,
                })) {
                    if (subvalue) {
                        val.calls.push(subkey, {
                            micros: subvalue.totalMicroseconds,
                        } as TraceNode);
                    }
                }
            } else if (key === "guildRelationQueryTime") {
                val.calls = [];
                for (const [subkey, subvalue] of Object.entries({
                    queryGuildChannelsTime,
                    queryGuildEmojisTime,
                    queryGuildRolesTime,
                    queryGuildStickersTime,
                    queryGuildVoiceStatesTime,
                })) {
                    if (subvalue) {
                        val.calls.push(subkey, {
                            micros: subvalue.totalMicroseconds,
                        } as TraceNode);
                    }
                }

                val.calls.push("mergeMemberGuildsTrace", mergeMemberGuildsTrace);
            } else if (key === "buildReadyEventDataTime") {
                val.calls = ["readyDataSerializationTime", buildReadyTrace];
                val.micros += buildReadyTrace.micros;
            }
        }
    }
    _trace![1].calls.push("buildTraceTime", {
        micros: taskSw.elapsed().totalMicroseconds,
    });
    d._trace = [JSON.stringify(_trace)];

    // Send READY
    await Send(this, {
        op: OPCODES.Dispatch,
        t: EVENTEnum.Ready,
        s: this.sequence++,
        d,
    });

    // If we're a bot user, send GUILD_CREATE for each unavailable guild
    // TODO: check if bot has permission to view some of these based on intents (i.e. GUILD_MEMBERS, GUILD_PRESENCES, GUILD_VOICE_STATES)
    await Promise.all(
        pending_guilds.map((x) => {
            //Even with the GUILD_MEMBERS intent, the bot always receives just itself as the guild members
            const botMemberObject = members.find((member) => member.guild_id === x.id);

            return Send(this, {
                op: OPCODES.Dispatch,
                t: EVENTEnum.GuildCreate,
                s: this.sequence++,
                d: {
                    ...x.toJSON(),
                    members: botMemberObject
                        ? [
                              {
                                  ...botMemberObject.toPublicMember(),
                                  user: user.toPublicUser(),
                              },
                          ]
                        : [],
                },
            })?.catch((e) => console.error(`[Gateway] error when sending bot guilds`, e));
        }),
    );

    const readySupplementalGuilds = (guilds.filter((guild) => !guild.unavailable) as Guild[]).map((guild) => {
        return {
            voice_states: guild.voice_states.map((state) => state.toPublicVoiceState()),
            id: guild.id,
            embedded_activities: [],
        };
    });

    // TODO: ready supplemental
    await Send(this, {
        op: OPCodes.DISPATCH,
        t: EVENTEnum.ReadySupplemental,
        s: this.sequence++,
        d: {
            merged_presences: {
                guilds: [],
                friends: [],
            },
            // these merged members seem to be all users currently in vc in your guilds
            merged_members: [],
            lazy_private_channels: [],
            guilds: readySupplementalGuilds, // { voice_states: [], id: string, embedded_activities: [] }
            // embedded_activities are users currently in an activity?
            disclose: [], // Config.get().general.uniqueUsernames ? ["pomelo"] : []
        },
    });

    //TODO send GUILD_MEMBER_LIST_UPDATE
    //TODO send VOICE_STATE_UPDATE to let the client know if another device is already connected to a voice channel
    await setupListener.call(this);
    console.log(`[Gateway] IDENTIFY ${this.user_id} in ${totalSw.elapsed().totalMilliseconds}ms`, process.env.LOG_GATEWAY_TRACES ? JSON.stringify(d._trace, null, 2) : "");
}
