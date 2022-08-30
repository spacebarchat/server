export interface TotpEnableSchema {
	password: string;
	code?: string;
	secret?: string;
}
