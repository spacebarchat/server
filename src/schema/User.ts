import { Length } from "../util/instanceOf";

export const UserModifySchema = {
	$username: new Length(String, 2, 32),
	$avatar: String,
	$bio: new Length(String, 0, 190),
	$accent_color: Number,
	$banner: String
};

export interface UserModifySchema {
	username?: string;
	avatar?: string | null;
	bio?: string;
	accent_color?: number | null;
	banner?: string | null;
}
