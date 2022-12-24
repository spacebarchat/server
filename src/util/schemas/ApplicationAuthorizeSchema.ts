export interface ApplicationAuthorizeSchema {
	authorize: boolean;
	guild_id: string;
	permissions: string;
	captcha_key?: string;
	code?: string;	// 2fa code
}