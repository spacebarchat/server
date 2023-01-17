export interface VerifyEmailSchema {
	captcha_key: string | null;
	token: string;
}
