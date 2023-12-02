import { User } from "@sentry/node";
import { PrivateUserKeys } from "@spacebar/util";

export type UserKeysAdmin = Exclude<
	PrivateUserKeys,
	"id" | "totp_secret" | "totp_last_ticket" | "data"
>;

// A user that is returned to the admin
export type UserAdmin = Pick<User, UserKeysAdmin>;
