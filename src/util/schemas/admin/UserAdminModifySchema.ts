import { User } from "@sentry/node";
import { UserKeysAdmin } from "./UserAdminSchema";

export type AdminUserModifySchema = Partial<
	Pick<User, UserKeysAdmin> & {
		password?: string;
	}
>;
