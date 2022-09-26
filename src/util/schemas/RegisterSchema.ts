export interface RegisterSchema {
	/**
	 * @minLength 2
	 * @maxLength 32
	 */
	username: string;
	/**
	 * @minLength 1
	 * @maxLength 72
	 */
	password?: string;
	consent: boolean;
	/**
	 * @TJS-format email
	 */
	email?: string;
	fingerprint?: string;
	invite?: string;
	/**
	 * @TJS-type string
	 */
	date_of_birth?: Date; // "2000-04-03"
	gift_code_sku_id?: string;
	captcha_key?: string;

	promotional_email_opt_in?: boolean;
}