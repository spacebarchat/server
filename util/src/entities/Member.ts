import { PublicUser, User } from "./User";
import { BaseClass } from "./BaseClass";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Guild } from "./Guild";

@Entity("members")
export class Member extends BaseClass {
	@Column()
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@Column()
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@Column()
	nick?: string;

	@Column("simple-array")
	roles: string[];

	@Column()
	joined_at: Date;

	@Column()
	premium_since?: number;

	@Column()
	deaf: boolean;

	@Column()
	mute: boolean;

	@Column()
	pending: boolean;

	@Column("simple-json")
	settings: UserGuildSettings;

	// TODO: update
	@Column("simple-json")
	read_state: Record<string, string | null>;
}

export interface UserGuildSettings {
	channel_overrides: {
		channel_id: string;
		message_notifications: number;
		mute_config: MuteConfig;
		muted: boolean;
	}[];
	message_notifications: number;
	mobile_push: boolean;
	mute_config: MuteConfig;
	muted: boolean;
	suppress_everyone: boolean;
	suppress_roles: boolean;
	version: number;
}

export interface MuteConfig {
	end_time: number;
	selected_time_window: number;
}

// @ts-ignore
export interface PublicMember extends Omit<Member, "settings" | "id" | "read_state"> {
	user: PublicUser;
}

export const PublicMemberProjection = {
	id: true,
	guild_id: true,
	nick: true,
	roles: true,
	joined_at: true,
	pending: true,
	deaf: true,
	mute: true,
	premium_since: true,
};
