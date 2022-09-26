export interface UserModifySchema {
	/**
	 * @minLength 1
	 * @maxLength 100
	 */
	username?: string;
	avatar?: string | null;
	/**
	 * @maxLength 1024
	 */
	bio?: string;
	accent_color?: number;
	banner?: string | null;
	password?: string;
	new_password?: string;
	code?: string;
	email?: string;
	discriminator?: string;
}