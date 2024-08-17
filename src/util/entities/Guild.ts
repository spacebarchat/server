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

import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	RelationId,
} from "typeorm";
import { Config, GuildWelcomeScreen, Snowflake, handleFile } from "..";
import { Ban } from "./Ban";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Emoji } from "./Emoji";
import { Invite } from "./Invite";
import { Member } from "./Member";
import { Role } from "./Role";
import { Sticker } from "./Sticker";
import { Template } from "./Template";
import { User } from "./User";
import { VoiceState } from "./VoiceState";
import { Webhook } from "./Webhook";

// TODO: application_command_count, application_command_counts: {1: 0, 2: 0, 3: 0}
// TODO: guild_scheduled_events
// TODO: stage_instances
// TODO: threads
// TODO:
// "keywords": [
// 		"Genshin Impact",
// 		"Paimon",
// 		"Honkai Impact",
// 		"ARPG",
// 		"Open-World",
// 		"Waifu",
// 		"Anime",
// 		"Genshin",
// 		"miHoYo",
// 		"Gacha"
// 	],

export const PublicGuildRelations = [
	"channels",
	"emojis",
	"roles",
	"stickers",
	"voice_states",
	// "members",		// TODO: These are public, but all members should not be fetched.
	// "members.user",
];

@Entity({
	name: "guilds",
	engine: "InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
})
export class Guild extends BaseClass {
	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.afk_channel)
	afk_channel_id?: string;

	@JoinColumn({ name: "afk_channel_id" })
	@ManyToOne(() => Channel)
	afk_channel?: Channel;

	@Column({ nullable: true })
	afk_timeout?: number;

	// * commented out -> use owner instead
	// application id of the guild creator if it is bot-created
	// @Column({ nullable: true })
	// application?: string;

	@JoinColumn({ name: "ban_ids" })
	@OneToMany(() => Ban, (ban: Ban) => ban.guild, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	bans: Ban[];

	@Column({ nullable: true })
	banner?: string;

	@Column({ nullable: true })
	default_message_notifications?: number;

	@Column({ nullable: true })
	description?: string;

	@Column({ nullable: true })
	discovery_splash?: string;

	@Column({ nullable: true })
	explicit_content_filter?: number;

	@Column({ type: "simple-array" })
	features: string[] = []; //TODO use enum
	//TODO: https://discord.com/developers/docs/resources/guild#guild-object-guild-features

	@Column({ nullable: true })
	primary_category_id?: string; // TODO: this was number?

	@Column({ nullable: true })
	icon?: string;

	@Column()
	large?: boolean = false;

	@Column({ nullable: true })
	max_members?: number;

	@Column({ nullable: true })
	max_presences?: number;

	@Column({ nullable: true })
	max_video_channel_users?: number;

	@Column({ nullable: true })
	member_count?: number;

	@Column({ nullable: true })
	presence_count?: number; // users online

	@OneToMany(() => Member, (member: Member) => member.guild, {
		cascade: true,
		orphanedRowAction: "delete",
		onDelete: "CASCADE",
	})
	members: Member[];

	@JoinColumn({ name: "role_ids" })
	@OneToMany(() => Role, (role: Role) => role.guild, {
		cascade: true,
		orphanedRowAction: "delete",
		onDelete: "CASCADE",
	})
	roles: Role[];

	@JoinColumn({ name: "channel_ids" })
	@OneToMany(() => Channel, (channel: Channel) => channel.guild, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	channels: Channel[];

	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.template)
	template_id?: string;

	@JoinColumn({ name: "template_id", referencedColumnName: "id" })
	@ManyToOne(() => Template)
	template: Template;

	@JoinColumn({ name: "emoji_ids" })
	@OneToMany(() => Emoji, (emoji: Emoji) => emoji.guild, {
		cascade: true,
		orphanedRowAction: "delete",
		onDelete: "CASCADE",
	})
	emojis: Emoji[];

	@JoinColumn({ name: "sticker_ids" })
	@OneToMany(() => Sticker, (sticker: Sticker) => sticker.guild, {
		cascade: true,
		orphanedRowAction: "delete",
		onDelete: "CASCADE",
	})
	stickers: Sticker[];

	@JoinColumn({ name: "invite_ids" })
	@OneToMany(() => Invite, (invite: Invite) => invite.guild, {
		cascade: true,
		orphanedRowAction: "delete",
		onDelete: "CASCADE",
	})
	invites: Invite[];

	@JoinColumn({ name: "voice_state_ids" })
	@OneToMany(() => VoiceState, (voicestate: VoiceState) => voicestate.guild, {
		cascade: true,
		orphanedRowAction: "delete",
		onDelete: "CASCADE",
	})
	voice_states: VoiceState[];

	@JoinColumn({ name: "webhook_ids" })
	@OneToMany(() => Webhook, (webhook: Webhook) => webhook.guild, {
		cascade: true,
		orphanedRowAction: "delete",
		onDelete: "CASCADE",
	})
	webhooks: Webhook[];

	@Column({ nullable: true })
	mfa_level?: number;

	@Column()
	name: string;

	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.owner)
	owner_id?: string; // optional to allow for ownerless guilds

	@JoinColumn({ name: "owner_id", referencedColumnName: "id" })
	@ManyToOne(() => User)
	owner?: User; // optional to allow for ownerless guilds

	@Column({ nullable: true })
	preferred_locale?: string;

	@Column({ nullable: true })
	premium_subscription_count?: number;

	@Column()
	premium_tier?: number; // crowd premium level

	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.public_updates_channel)
	public_updates_channel_id: string;

	@JoinColumn({ name: "public_updates_channel_id" })
	@ManyToOne(() => Channel)
	public_updates_channel?: Channel;

	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.rules_channel)
	rules_channel_id?: string;

	@JoinColumn({ name: "rules_channel_id" })
	@ManyToOne(() => Channel)
	rules_channel?: string;

	@Column({ nullable: true })
	region?: string;

	@Column({ nullable: true })
	splash?: string;

	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.system_channel)
	system_channel_id?: string;

	@JoinColumn({ name: "system_channel_id" })
	@ManyToOne(() => Channel)
	system_channel?: Channel;

	@Column({ nullable: true })
	system_channel_flags?: number;

	@Column()
	unavailable: boolean = false;

	@Column({ nullable: true })
	verification_level?: number;

	@Column({ type: "simple-json" })
	welcome_screen: GuildWelcomeScreen;

	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.widget_channel)
	widget_channel_id?: string;

	@JoinColumn({ name: "widget_channel_id" })
	@ManyToOne(() => Channel)
	widget_channel?: Channel;

	@Column()
	widget_enabled: boolean = true;

	@Column({ nullable: true })
	nsfw_level?: number;

	@Column()
	nsfw: boolean = false;

	// TODO: nested guilds
	@Column({ nullable: true })
	parent?: string;

	// only for developer portal
	permissions?: number;

	//new guild settings, 11/08/2022:
	@Column({ nullable: true })
	premium_progress_bar_enabled: boolean = false;

	@Column({ select: false, type: "simple-array" })
	channel_ordering: string[];

	static async createGuild(body: {
		name?: string;
		icon?: string | null;
		owner_id?: string;
		channels?: Partial<Channel>[];
	}) {
		const guild_id = Snowflake.generate();

		const guild = await Guild.create({
			id: guild_id,
			name: body.name || "Spacebar",
			icon: await handleFile(`/icons/${guild_id}`, body.icon as string),
			owner_id: body.owner_id, // TODO: need to figure out a way for ownerless guilds and multiply-owned guilds
			presence_count: 0,
			member_count: 0, // will automatically be increased by addMember()
			mfa_level: 0,
			preferred_locale: "en-US",
			premium_subscription_count: 0,
			premium_tier: 0,
			system_channel_flags: 4, // defaults effect: suppress the setup tips to save performance
			nsfw_level: 0,
			verification_level: 0,
			welcome_screen: {
				enabled: false,
				description: "",
				welcome_channels: [],
			},
			channel_ordering: [],

			afk_timeout: Config.get().defaults.guild.afkTimeout,
			default_message_notifications:
				Config.get().defaults.guild.defaultMessageNotifications,
			explicit_content_filter:
				Config.get().defaults.guild.explicitContentFilter,
			features: Config.get().guild.defaultFeatures,
			max_members: Config.get().limits.guild.maxMembers,
			max_presences: Config.get().defaults.guild.maxPresences,
			max_video_channel_users:
				Config.get().defaults.guild.maxVideoChannelUsers,
			region: Config.get().regions.default,
		}).save();

		// we have to create the role _after_ the guild because else we would get a "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed" error
		// TODO: make the @everyone a pseudorole that is dynamically generated at runtime so we can save storage
		await Role.create({
			id: guild_id,
			guild_id: guild_id,
			color: 0,
			hoist: false,
			managed: false,
			// NB: in Spacebar, every role will be non-managed, as we use user-groups instead of roles for managed groups
			mentionable: false,
			name: "@everyone",
			permissions: String("2251804225"),
			position: 0,
			icon: undefined,
			unicode_emoji: undefined,
			flags: 0, // TODO?
		}).save();

		if (!body.channels || !body.channels.length)
			body.channels = [
				{ id: "01", type: 0, name: "general", nsfw: false },
			];

		const ids = new Map();

		body.channels.forEach((x) => {
			if (x.id) {
				ids.set(x.id, Snowflake.generate());
			}
		});

		for (const channel of body.channels.sort((a) =>
			a.parent_id ? 1 : -1,
		)) {
			const id = ids.get(channel.id) || Snowflake.generate();

			const parent_id = ids.get(channel.parent_id);

			const saved = await Channel.createChannel(
				{ ...channel, guild_id, id, parent_id },
				body.owner_id,
				{
					keepId: true,
					skipExistsCheck: true,
					skipPermissionCheck: true,
					skipEventEmit: true,
				},
			);

			await Guild.insertChannelInOrder(
				guild.id,
				saved.id,
				parent_id ?? channel.position ?? 0,
				guild,
			);
		}

		return guild;
	}

	/** Insert a channel into the guild ordering by parent channel id or position */
	static async insertChannelInOrder(
		guild_id: string,
		channel_id: string,
		position: number,
		guild?: Guild,
	): Promise<number>;
	static async insertChannelInOrder(
		guild_id: string,
		channel_id: string,
		parent_id: string,
		guild?: Guild,
	): Promise<number>;
	static async insertChannelInOrder(
		guild_id: string,
		channel_id: string,
		insertPoint: string | number,
		guild?: Guild,
	): Promise<number>;
	static async insertChannelInOrder(
		guild_id: string,
		channel_id: string,
		insertPoint: string | number,
		guild?: Guild,
	): Promise<number> {
		if (!guild)
			guild = await Guild.findOneOrFail({
				where: { id: guild_id },
				select: { channel_ordering: true },
			});

		let position;
		if (typeof insertPoint == "string")
			position = guild.channel_ordering.indexOf(insertPoint) + 1;
		else position = insertPoint;

		guild.channel_ordering.remove(channel_id);

		guild.channel_ordering.splice(position, 0, channel_id);
		await Guild.update(
			{ id: guild_id },
			{ channel_ordering: guild.channel_ordering },
		);
		return position;
	}

	toJSON(): Guild {
		return {
			...this,
			unavailable: this.unavailable == false ? undefined : true,
			channel_ordering: undefined,
		};
	}
}
