import {
	Member,
	PublicConnectedAccount,
	PublicMember,
	PublicUser,
	User,
} from "@spacebar/util";

export type MutualGuild = {
	id: string;
	nick?: string;
};

export type PublicMemberProfile = Pick<
	Member,
	"banner" | "bio" | "guild_id"
> & {
	accent_color: null; // TODO
};

export type UserProfile = Pick<
	User,
	"bio" | "accent_color" | "banner" | "pronouns" | "theme_colors"
>;

export interface UserProfileResponse {
	user: PublicUser;
	connected_accounts: PublicConnectedAccount;
	premium_guild_since?: Date;
	premium_since?: Date;
	mutual_guilds: MutualGuild[];
	premium_type: number;
	profile_themes_experiment_bucket: number;
	user_profile: UserProfile;
	guild_member?: PublicMember;
	guild_member_profile?: PublicMemberProfile;
}
