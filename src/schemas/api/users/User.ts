/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

import { ConnectedAccountSchema, Snowflake, UserSettingsSchema } from "@spacebar/schemas";
import { BitField } from "@spacebar/util/util";
import { Relationship, Session } from "@spacebar/util/entities";

interface UserEntityPleaseRewriteThankYou {
	id: Snowflake;
	username: string;
	discriminator: string;
	avatar?: string;
	accent_color?: number;
	banner?: string;
	theme_colors?: number[];
	pronouns?: string;
	phone?: string;
	desktop: boolean;
	mobile: boolean;
	premium: boolean;
	premium_type: number;
	bot: boolean;
	bio: string;
	system: boolean;
	nsfw_allowed: boolean;
	mfa_enabled: boolean;
	webauthn_enabled: boolean;
	created_at: Date;
	premium_since: Date;
	verified: boolean;
	disabled: boolean;
	deleted: boolean;
	email?: string;
	flags: number;
	public_flags: number;
	purchased_flags: number;
	premium_usage_flags: number;
	rights: string;
	sessions: Session[];
	relationships: Relationship[];
	connected_accounts: ConnectedAccountSchema[];
	fingerprints: string[];
	settings?: UserSettingsSchema;
	extended_settings: string;
	badge_ids?: string[];
}

export interface PartialUser {
	id: Snowflake;
	username: string;
	discriminator: string;
	global_name?: string | null;
	avatar: string | null;
	avatar_decoration_data?: AvatarDecorationData | null;
	collectibles?: Collectibles | null;
	display_name_styles?: DisplayNameStyle | null;
	primary_guild?: PrimaryGuild | null;
	bot?: boolean;
	system?: boolean;
	banner?: string | null;
	accent_color?: number | null;
	public_flags?: number;
}

export interface AvatarDecorationData {
	asset: string;
	sku_id: Snowflake;
	expires_at: string | null;
}

export interface Collectibles {
	nameplate: NameplateData | null;
}

export interface NameplateData {
	asset: string;
	sku_id: Snowflake;
	label: string;
	palette: string;
	expires_at: number | null;
}

export interface DisplayNameStyle {
	font_id: number;
	effect_id: number;
	colors: number;
}

export interface PrimaryGuild {
	identity_enabled: boolean | null;
	identity_guild_id: Snowflake | null;
	tag: string | null;
	badge: string | null;
}

export enum PublicUserEnum {
	username,
	discriminator,
	id,
	public_flags,
	avatar,
	accent_color,
	banner,
	bio,
	bot,
	premium_since,
	premium_type,
	theme_colors,
	pronouns,
	badge_ids,
}
export type PublicUserKeys = keyof typeof PublicUserEnum;

export enum PrivateUserEnum {
	flags,
	mfa_enabled,
	email,
	phone,
	verified,
	nsfw_allowed,
	premium,
	premium_type,
	purchased_flags,
	premium_usage_flags,
	disabled,
	settings,
	// locale
}

export type PrivateUserKeys = keyof typeof PrivateUserEnum | PublicUserKeys;

export const PublicUserProjection = Object.values(PublicUserEnum).filter((x) => typeof x === "string") as PublicUserKeys[];
export const PrivateUserProjection = [...PublicUserProjection, ...Object.values(PrivateUserEnum).filter((x) => typeof x === "string")] as PrivateUserKeys[];

// Private user data that should never get sent to the client
export type PublicUser = Pick<UserEntityPleaseRewriteThankYou, PublicUserKeys>;
export type PrivateUser = Pick<UserEntityPleaseRewriteThankYou, PrivateUserKeys>;

export interface UserPrivate extends Pick<UserEntityPleaseRewriteThankYou, PrivateUserKeys> {
	locale: string;
}

export const CUSTOM_USER_FLAG_OFFSET = BigInt(1) << BigInt(32);

// This causes a failure in openapi.js...?
export class UserFlags extends BitField {
	static FLAGS = {
		DISCORD_EMPLOYEE: BigInt(1) << BigInt(0),
		PARTNERED_SERVER_OWNER: BigInt(1) << BigInt(1),
		HYPESQUAD_EVENTS: BigInt(1) << BigInt(2),
		BUGHUNTER_LEVEL_1: BigInt(1) << BigInt(3),
		MFA_SMS: BigInt(1) << BigInt(4),
		PREMIUM_PROMO_DISMISSED: BigInt(1) << BigInt(5),
		HOUSE_BRAVERY: BigInt(1) << BigInt(6),
		HOUSE_BRILLIANCE: BigInt(1) << BigInt(7),
		HOUSE_BALANCE: BigInt(1) << BigInt(8),
		EARLY_SUPPORTER: BigInt(1) << BigInt(9),
		TEAM_USER: BigInt(1) << BigInt(10),
		TRUST_AND_SAFETY: BigInt(1) << BigInt(11),
		SYSTEM: BigInt(1) << BigInt(12),
		HAS_UNREAD_URGENT_MESSAGES: BigInt(1) << BigInt(13),
		BUGHUNTER_LEVEL_2: BigInt(1) << BigInt(14),
		UNDERAGE_DELETED: BigInt(1) << BigInt(15),
		VERIFIED_BOT: BigInt(1) << BigInt(16),
		EARLY_VERIFIED_BOT_DEVELOPER: BigInt(1) << BigInt(17),
		CERTIFIED_MODERATOR: BigInt(1) << BigInt(18),
		BOT_HTTP_INTERACTIONS: BigInt(1) << BigInt(19),
	};
}
