import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne } from "typeorm";
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
	@Column()
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

	@Column("simple-array")
	member_ids: string[];

	@JoinColumn({ name: "member_ids" })
	@ManyToMany(() => Member, (member: Member) => member.id)
	members: Member[];

	@Column("simple-array")
	role_ids: string[];

	@JoinColumn({ name: "role_ids" })
	@ManyToMany(() => Role, (role: Role) => role.id)
	roles: Role[];

	@Column("simple-array")
	channel_ids: string[];

	@JoinColumn({ name: "channel_ids" })
	@ManyToMany(() => Channel, (channel: Channel) => channel.id)
	channels: Channel[];

	@Column("simple-array")
	emoji_ids: string[];

	@JoinColumn({ name: "emoji_ids" })
	@ManyToMany(() => Emoji, (emoji: Emoji) => emoji.id)
	emojis: Emoji[];

	@Column("simple-array")
	voice_state_ids: string[];

	@JoinColumn({ name: "voice_state_ids" })
	@ManyToMany(() => VoiceState, (voicestate: VoiceState) => voicestate.id)
	voice_states: VoiceState[];

	@Column()
	mfa_level?: number;

	@Column()
	name: string;

	@Column()
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

	@JoinColumn({ name: "public_updates_channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	public_updates_channel?: Channel;

	@Column()
	rules_channel_id?: string;

	@JoinColumn({ name: "rules_channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	rules_channel?: string;

	@Column()
	region?: string;

	@Column()
	splash?: string;

	@Column()
	system_channel_id?: string;

	@JoinColumn({ name: "system_channel_id" })
	@ManyToMany(() => Channel, (channel: Channel) => channel.id)
	system_channel?: Channel;

	@Column()
	system_channel_flags?: number;

	@Column()
	unavailable?: boolean;

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

	@JoinColumn({ name: "widget_channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	widget_channel?: Channel;

	@Column()
	widget_enabled?: boolean;
}
