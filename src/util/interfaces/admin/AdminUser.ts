import { User } from "@sentry/node";

export enum AdminUserEnum {
	id,
	username,
	discriminator,
	avatar,
	accent_color,
	banner,
	theme_colors,
	pronouns,
	phone,
	desktop,
	mobile,
	premium,
	premium_type,
	bot,
	bio,
	system,
	nsfw_allowed,
	mfa_enabled,
	webauthn_enabled,
	created_at,
	premium_since,
	verified,
	disabled,
	deleted,
	email,
	flags,
	purchased_flags,
	premium_usage_flags,
	rights,
	relationships,
	connected_accounts,
	fingerprints,
	settings,
	extended_settings,
	security_keys,
}

export type AdminUserKeys = keyof typeof AdminUserEnum;
// A user that is returned to the admin
export type AdminUser = Pick<User, AdminUserKeys>;

export const AdminUserProjection = Object.values(AdminUserEnum).filter(
	(x) => typeof x === "string",
) as AdminUserKeys[];
