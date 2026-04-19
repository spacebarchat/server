/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { PublicUser } from "@spacebar/schemas";
// TODO: remove entity import
import { Member } from "@spacebar/util";

export interface ChannelOverride {
    message_notifications: number;
    mute_config: MuteConfig;
    muted: boolean;
    channel_id: string | null;
}

export interface UserGuildSettings {
    // channel_overrides: {
    // 	channel_id: string;
    // 	message_notifications: number;
    // 	mute_config: MuteConfig;
    // 	muted: boolean;
    // }[];

    channel_overrides: {
        [channel_id: string]: ChannelOverride;
    } | null;
    message_notifications: number;
    mobile_push: boolean;
    mute_config: MuteConfig | null;
    muted: boolean;
    suppress_everyone: boolean;
    suppress_roles: boolean;
    version: number;
    guild_id: string | null;
    flags: number;
    mute_scheduled_events: boolean;
    hide_muted_channels: boolean;
    notify_highlights: 0;
}

export const DefaultUserGuildSettings: UserGuildSettings = {
    channel_overrides: null,
    message_notifications: 1,
    flags: 0,
    hide_muted_channels: false,
    mobile_push: true,
    mute_config: null,
    mute_scheduled_events: false,
    muted: false,
    notify_highlights: 0,
    suppress_everyone: false,
    suppress_roles: false,
    version: 453, // ?
    guild_id: null,
};

export interface MuteConfig {
    end_time: number;
    selected_time_window: number;
}

export type PublicMemberKeys =
    | "id"
    | "guild_id"
    | "nick"
    | "roles"
    | "joined_at"
    | "pending"
    | "deaf"
    | "mute"
    | "premium_since"
    | "avatar"
    | "banner"
    | "bio"
    | "theme_colors"
    | "pronouns"
    | "communication_disabled_until"
    | "flags";

export const PublicMemberProjection: PublicMemberKeys[] = [
    "id",
    "guild_id",
    "nick",
    "roles",
    "joined_at",
    "pending",
    "deaf",
    "mute",
    "premium_since",
    "avatar",
    "banner",
    "bio",
    "theme_colors",
    "pronouns",
    "communication_disabled_until",
    "flags",
];

// TODO: make a proper schema rather than inheriting entity
export type PublicMember = Omit<Pick<Member, PublicMemberKeys>, "roles"> & {
    user: PublicUser;
    roles: string[]; // only role ids not objects
};
