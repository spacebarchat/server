import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, RelationId } from "typeorm";
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

	@Column()
	afk_timeout?: number;

	// * commented out -> use owner instead
	// application id of the guild creator if it is bot-created
	// @Column()
	// application?: string;

	@Column()
	banner?: string;

	@Column()
	default_message_notifications?: number;

	@Column()
	description?: string;

	@Column()
	discovery_splash?: string;

	@Column()
	explicit_content_filter?: number;

	@Column("simple-array")
	features: string[];

	@Column()
	icon?: string;

	@Column()
	large?: boolean;

	@Column()
	max_members?: number; // e.g. default 100.000

	@Column()
	max_presences?: number;

	@Column()
	max_video_channel_users?: number; // ? default: 25, is this max 25 streaming or watching

	@Column()
	member_count?: number;

	@Column()
	presence_count?: number; // users online

	@RelationId((guild: Guild) => guild.members)
	member_ids: string[];

	@JoinColumn({ name: "member_ids" })
	@ManyToMany(() => Member, (member: Member) => member.id)
	members: Member[];

	@RelationId((guild: Guild) => guild.roles)
	role_ids: string[];

	@JoinColumn({ name: "role_ids" })
	@ManyToMany(() => Role, (role: Role) => role.id)
	roles: Role[];

	@RelationId((guild: Guild) => guild.channels)
	channel_ids: string[];

	@JoinColumn({ name: "channel_ids" })
	@ManyToMany(() => Channel, (channel: Channel) => channel.id)
	channels: Channel[];

	@RelationId((guild: Guild) => guild.emojis)
	emoji_ids: string[];

	@JoinColumn({ name: "emoji_ids" })
	@ManyToMany(() => Emoji, (emoji: Emoji) => emoji.id)
	emojis: Emoji[];

	@RelationId((guild: Guild) => guild.voice_states)
	voice_state_ids: string[];

	@JoinColumn({ name: "voice_state_ids" })
	@ManyToMany(() => VoiceState, (voicestate: VoiceState) => voicestate.id)
	voice_states: VoiceState[];

	@Column()
	mfa_level?: number;

	@Column()
	name: string;

	@RelationId((guild: Guild) => guild.owner)
	owner_id: string;

	@JoinColumn({ name: "owner_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	owner: User;

	@Column()
	preferred_locale?: string; // only community guilds can choose this

	@Column()
	premium_subscription_count?: number;

	@Column()
	premium_tier?: number; // nitro boost level

	@RelationId((guild: Guild) => guild.public_updates_channel)
	public_updates_channel_id: string;

	@JoinColumn({ name: "public_updates_channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	public_updates_channel?: Channel;

	@RelationId((guild: Guild) => guild.rules_channel)
	rules_channel_id?: string;

	@JoinColumn({ name: "rules_channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	rules_channel?: string;

	@Column()
	region?: string;

	@Column()
	splash?: string;

	@RelationId((guild: Guild) => guild.system_channel)
	system_channel_id?: string;

	@JoinColumn({ name: "system_channel_id" })
	@ManyToMany(() => Channel, (channel: Channel) => channel.id)
	system_channel?: Channel;

	@Column()
	system_channel_flags?: number;

	@Column()
	unavailable?: boolean;

	@RelationId((guild: Guild) => guild.vanity_url)
	vanity_url_code?: string;

	@JoinColumn({ name: "vanity_url_code" })
	@OneToOne(() => Invite, (invite: Invite) => invite.code)
	vanity_url?: Invite;

	@Column()
	verification_level?: number;

	@Column("simple-json")
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
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	widget_channel?: Channel;

	@Column()
	widget_enabled?: boolean;
}
