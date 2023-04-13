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
	Channel,
	ChannelOverride,
	ChannelType,
	Emoji,
	Guild,
	PublicUser,
	Role,
	Sticker,
	UserGuildSettings,
	PublicMember,
} from "../entities";

// TODO: this is not the best place for this type
export type ReadyUserGuildSettingsEntries = Omit<
	UserGuildSettings,
	"channel_overrides"
> & {
	channel_overrides: (ChannelOverride & { channel_id: string })[];
};

// TODO: probably should move somewhere else
export interface ReadyPrivateChannel {
	id: string;
	flags: number;
	is_spam: boolean;
	last_message_id?: string;
	recipients: PublicUser[];
	type: ChannelType.DM | ChannelType.GROUP_DM;
}

export type GuildOrUnavailable =
	| { id: string; unavailable: boolean }
	| (Guild & { joined_at?: Date; unavailable: boolean });

const guildIsAvailable = (
	guild: GuildOrUnavailable,
): guild is Guild & { joined_at: Date; unavailable: false } => {
	return guild.unavailable == false;
};

export interface IReadyGuildDTO {
	application_command_counts?: { 1: number; 2: number; 3: number }; // ????????????
	channels: Channel[];
	data_mode: string; // what is this
	emojis: Emoji[];
	guild_scheduled_events: unknown[]; // TODO
	id: string;
	large: boolean | undefined;
	lazy: boolean;
	member_count: number | undefined;
	members: PublicMember[];
	premium_subscription_count: number | undefined;
	properties: {
		name: string;
		description?: string | null;
		icon?: string | null;
		splash?: string | null;
		banner?: string | null;
		features: string[];
		preferred_locale?: string | null;
		owner_id?: string | null;
		application_id?: string | null;
		afk_channel_id?: string | null;
		afk_timeout: number | undefined;
		system_channel_id?: string | null;
		verification_level: number | undefined;
		explicit_content_filter: number | undefined;
		default_message_notifications: number | undefined;
		mfa_level: number | undefined;
		vanity_url_code?: string | null;
		premium_tier: number | undefined;
		premium_progress_bar_enabled: boolean;
		system_channel_flags: number | undefined;
		discovery_splash?: string | null;
		rules_channel_id?: string | null;
		public_updates_channel_id?: string | null;
		max_video_channel_users: number | undefined;
		max_members: number | undefined;
		nsfw_level: number | undefined;
		hub_type?: unknown | null; // ????

		home_header: null; // TODO
		latest_onboarding_question_id: null; // TODO
		safety_alerts_channel_id: null; // TODO
		max_stage_video_channel_users: 50; // TODO
		nsfw: boolean;
		id: string;
	};
	roles: Role[];
	stage_instances: unknown[];
	stickers: Sticker[];
	threads: unknown[];
	version: string;
	guild_hashes: unknown;
	unavailable: boolean;
}

export class ReadyGuildDTO implements IReadyGuildDTO {
	application_command_counts?: { 1: number; 2: number; 3: number }; // ????????????
	channels: Channel[];
	data_mode: string; // what is this
	emojis: Emoji[];
	guild_scheduled_events: unknown[];
	id: string;
	large: boolean | undefined;
	lazy: boolean;
	member_count: number | undefined;
	members: PublicMember[];
	premium_subscription_count: number | undefined;
	properties: {
		name: string;
		description?: string | null;
		icon?: string | null;
		splash?: string | null;
		banner?: string | null;
		features: string[];
		preferred_locale?: string | null;
		owner_id?: string | null;
		application_id?: string | null;
		afk_channel_id?: string | null;
		afk_timeout: number | undefined;
		system_channel_id?: string | null;
		verification_level: number | undefined;
		explicit_content_filter: number | undefined;
		default_message_notifications: number | undefined;
		mfa_level: number | undefined;
		vanity_url_code?: string | null;
		premium_tier: number | undefined;
		premium_progress_bar_enabled: boolean;
		system_channel_flags: number | undefined;
		discovery_splash?: string | null;
		rules_channel_id?: string | null;
		public_updates_channel_id?: string | null;
		max_video_channel_users: number | undefined;
		max_members: number | undefined;
		nsfw_level: number | undefined;
		hub_type?: unknown | null; // ????

		home_header: null; // TODO
		latest_onboarding_question_id: null; // TODO
		safety_alerts_channel_id: null; // TODO
		max_stage_video_channel_users: 50; // TODO
		nsfw: boolean;
		id: string;
	};
	roles: Role[];
	stage_instances: unknown[];
	stickers: Sticker[];
	threads: unknown[];
	version: string;
	guild_hashes: unknown;
	unavailable: boolean;
	joined_at: Date;

	constructor(guild: GuildOrUnavailable) {
		if (!guildIsAvailable(guild)) {
			this.id = guild.id;
			this.unavailable = true;
			return;
		}

		this.application_command_counts = {
			1: 5,
			2: 2,
			3: 2,
		}; // ?????
		this.channels = guild.channels;
		this.data_mode = "full";
		this.emojis = guild.emojis;
		this.guild_scheduled_events = [];
		this.id = guild.id;
		this.large = guild.large;
		this.lazy = true; // ??????????
		this.member_count = guild.member_count;
		this.members = guild.members?.map((x) => x.toPublicMember());
		this.premium_subscription_count = guild.premium_subscription_count;
		this.properties = {
			name: guild.name,
			description: guild.description,
			icon: guild.icon,
			splash: guild.splash,
			banner: guild.banner,
			features: guild.features,
			preferred_locale: guild.preferred_locale,
			owner_id: guild.owner_id,
			application_id: null, // ?????
			afk_channel_id: guild.afk_channel_id,
			afk_timeout: guild.afk_timeout,
			system_channel_id: guild.system_channel_id,
			verification_level: guild.verification_level,
			explicit_content_filter: guild.explicit_content_filter,
			default_message_notifications: guild.default_message_notifications,
			mfa_level: guild.mfa_level,
			vanity_url_code: null, // ?????
			premium_tier: guild.premium_tier,
			premium_progress_bar_enabled: guild.premium_progress_bar_enabled,
			system_channel_flags: guild.system_channel_flags,
			discovery_splash: guild.discovery_splash,
			rules_channel_id: guild.rules_channel_id,
			public_updates_channel_id: guild.public_updates_channel_id,
			max_video_channel_users: guild.max_video_channel_users,
			max_members: guild.max_members,
			nsfw_level: guild.nsfw_level,
			hub_type: null,

			home_header: null,
			id: guild.id,
			latest_onboarding_question_id: null,
			max_stage_video_channel_users: 50, // TODO
			nsfw: guild.nsfw,
			safety_alerts_channel_id: null,
		};
		this.roles = guild.roles;
		this.stage_instances = [];
		this.stickers = guild.stickers;
		this.threads = [];
		this.version = "1"; // ??????
		this.guild_hashes = {};
		this.joined_at = guild.joined_at;
	}

	toJSON() {
		return this as IReadyGuildDTO;
	}
}
