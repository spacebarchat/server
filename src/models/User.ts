import { UserFlags } from "../util/UserFlags";

export interface User {
	id: BigInt;
	username: string;
	discriminator: string;
	avatar: string;
	bot: boolean;
	system: boolean;
	mfa_enabled: boolean;
	locale: string;
	verified: boolean;
	email: string;
	flags: UserFlags;
}
