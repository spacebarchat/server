import { Length } from "../util/instanceOf";

export const UserModifySchema = {
	$username: new Length(String, 2, 32),
	$avatar: String,
	$bio: new Length(String, 0, 190),
	$accent_color: Number,
	$banner: String,
	$password: String,
	$new_password: String,
	$code: String // 2fa code
};

export interface UserModifySchema {
	username?: string;
	avatar?: string | null;
	bio?: string;
	accent_color?: number | null;
	banner?: string | null;
	password?: string;
	new_password?: string;
	code?: string;
}
