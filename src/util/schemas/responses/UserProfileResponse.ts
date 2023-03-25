import { PublicConnectedAccount, PublicUser } from "../../entities";

export interface UserProfileResponse {
	user: PublicUser;
	connected_accounts: PublicConnectedAccount;
	premium_guild_since?: Date;
	premium_since?: Date;
}
