import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Emoji } from "./Emoji";
import { Invite } from "./Invite";
import { Member } from "./Member";
import { Role } from "./Role";
import { User } from "./User";
import { VoiceState } from "./VoiceState";

@Entity("guilds")
export class Guild extends BaseClass {
	@RelationId((guild: Guild) => guild.afk_channel)
	afk_channel_id?: string;

	@JoinColumn({ name: "afk_channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	afk_channel?: Channel;

	@Column({ nullable: true })
	afk_timeout?: number;

	// * commented out -> use owner instead
	// application id of the guild creator if it is bot-created
	// @Column({ nullable: true })
	// application?: string;

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
	features: string[];

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

	@RelationId((guild: Guild) => guild.members)
	member_ids: string[];

	@JoinColumn({ name: "member_ids" })
	@OneToMany(() => Member, (member: Member) => member.guild)
	members: Member[];

	@RelationId((guild: Guild) => guild.roles)
	role_ids: string[];

	@JoinColumn({ name: "role_ids" })
	@OneToMany(() => Role, (role: Role) => role.guild)
	roles: Role[];

	@RelationId((guild: Guild) => guild.channels)
	channel_ids: string[];

	@JoinColumn({ name: "channel_ids" })
	@OneToMany(() => Channel, (channel: Channel) => channel.guild)
	channels: Channel[];

	@RelationId((guild: Guild) => guild.emojis)
	emoji_ids: string[];

	@JoinColumn({ name: "emoji_ids" })
	@OneToMany(() => Emoji, (emoji: Emoji) => emoji.guild)
	emojis: Emoji[];

	@RelationId((guild: Guild) => guild.voice_states)
	voice_state_ids: string[];

	@JoinColumn({ name: "voice_state_ids" })
	@OneToMany(() => VoiceState, (voicestate: VoiceState) => voicestate.guild)
	voice_states: VoiceState[];

	@Column({ nullable: true })
	mfa_level?: number;

	@Column()
	name: string;

	@RelationId((guild: Guild) => guild.owner)
	owner_id: string;

	@JoinColumn({ name: "owner_id" })
	@OneToOne(() => User)
	owner: User;

	@Column({ nullable: true })
	preferred_locale?: string; // only community guilds can choose this

	@Column({ nullable: true })
	premium_subscription_count?: number;

	@Column({ nullable: true })
	premium_tier?: number; // nitro boost level

	@RelationId((guild: Guild) => guild.public_updates_channel)
	public_updates_channel_id: string;

	@JoinColumn({ name: "public_updates_channel_id" })
	@OneToOne(() => Channel, (channel: Channel) => channel.id)
	public_updates_channel?: Channel;

	@RelationId((guild: Guild) => guild.rules_channel)
	rules_channel_id?: string;

	@JoinColumn({ name: "rules_channel_id" })
	@OneToOne(() => Channel, (channel: Channel) => channel.id)
	rules_channel?: string;

	@Column({ nullable: true })
	region?: string;

	@Column({ nullable: true })
	splash?: string;

	@RelationId((guild: Guild) => guild.system_channel)
	system_channel_id?: string;

	@JoinColumn({ name: "system_channel_id" })
	@OneToOne(() => Channel, (channel: Channel) => channel.id)
	system_channel?: Channel;

	@Column({ nullable: true })
	system_channel_flags?: number;

	@Column({ nullable: true })
	unavailable?: boolean;

	@RelationId((guild: Guild) => guild.vanity_url)
	vanity_url_code?: string;

	@JoinColumn({ name: "vanity_url_code" })
	@OneToOne(() => Invite)
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

	@RelationId((guild: Guild) => guild.widget_channel)
	widget_channel_id?: string;

	@JoinColumn({ name: "widget_channel_id" })
	@OneToOne(() => Channel, (channel: Channel) => channel.id)
	widget_channel?: Channel;

	@Column({ nullable: true })
	widget_enabled?: boolean;
}
