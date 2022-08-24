export interface TotpSchema {
	code: string;
	ticket: string;
	gift_code_sku_id?: string | null;
	login_source?: string | null;
}
