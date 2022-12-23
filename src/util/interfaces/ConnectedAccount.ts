export interface ConnectedAccountCommonOAuthTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
	refresh_token?: string;
	expires_in?: number;
}

export interface ConnectedAccountTokenData {
	access_token: string;
	token_type?: string;
	scope?: string;
	refresh_token?: string;
	expires_in?: number;
	expires_at?: number;
}
