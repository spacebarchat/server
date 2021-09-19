import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, RelationId } from "typeorm";
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
// TODO: categories:
// [{
// 	"id": 16,
// 	"name": {
// 		"default": "Anime & Manga",
// 		"localizations": {
// 			"de": "Anime & Manga",
// 			"fr": "Anim\u00e9s et mangas",
// 			"ru": "\u0410\u043d\u0438\u043c\u0435 \u0438 \u043c\u0430\u043d\u0433\u0430"
// 		}
// 	},
// 	"is_primary": false
// }]
// TODO:
//  primary_category :{
// 	id: 1,
// 	name: {
// 		default: "Gaming",
// 		localizations: { de: "Gaming", fr: "Gaming", ru: "\u0418\u0433\u0440\u044b" },
// 		is_primary: true,
// 	},
// };
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
	"members",
	"roles",
	"stickers",
	"voice_states",
	"members.user",
];

@Entity("guilds")
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
		onDelete: "CASCADE",
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
	features: string[]; //TODO use enum
	//TODO: https://discord.com/developers/docs/resources/guild#guild-object-guild-features

	@Column({ nullable: true })
	icon?: string;

	@Column({ nullable: true })
	large?: boolean;

	@Column({ nullable: true })
	max_members?: number; // e.g. default 100.000

	@Column({ nullable: true })
	max_presences?: number;

	@Column({ nullable: true })
	max_video_channel_users?: number; // ? default: 25, is this max 25 streaming or watching

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
		onDelete: "CASCADE",
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
	owner_id: string;

	@JoinColumn({ name: "owner_id", referencedColumnName: "id" })
	@ManyToOne(() => User)
	owner: User;

	@Column({ nullable: true })
	preferred_locale?: string; // only community guilds can choose this

	@Column({ nullable: true })
	premium_subscription_count?: number;

	@Column({ nullable: true })
	premium_tier?: number; // nitro boost level

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

	@Column({ nullable: true })
	unavailable?: boolean;

	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.vanity_url)
	vanity_url_code?: string;

	@JoinColumn({ name: "vanity_url_code" })
	@ManyToOne(() => Invite)
	vanity_url?: Invite;

	@Column({ nullable: true })
	verification_level?: number;

	@Column({ type: "simple-json" })
	welcome_screen: {
		enabled: boolean;
		description: string;
		welcome_channels: {
			description: string;
			emoji_id?: string;
			emoji_name: string;
			channel_id: string;
		}[];
	};

	@Column({ nullable: true })
	@RelationId((guild: Guild) => guild.widget_channel)
	widget_channel_id?: string;

	@JoinColumn({ name: "widget_channel_id" })
	@ManyToOne(() => Channel)
	widget_channel?: Channel;

	@Column({ nullable: true })
	widget_enabled?: boolean;

	@Column({ nullable: true })
	nsfw_level?: number;

	@Column({ nullable: true })
	nsfw?: boolean;
}
