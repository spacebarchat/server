export interface OIDConnectionCallbackParams {
	"openid.assoc_handle": string;
	"openid.claimed_id": string;
	"openid.identity": string;
	"openid.mode": string;
	"openid.ns": string;
	"openid.op_endpoint": string;
	"openid.response_nonce": string;
	"openid.return_to": string;
	"openid.sig": string;
	"openid.signed": string;
}

export interface ConnectionCallbackSchema {
	friend_sync: boolean;
	insecure: boolean;
	state: string;
}

export interface OAuthConnectionCallbackSchema extends ConnectionCallbackSchema {
	code: string;
}

export interface OIDConnectionCallbackSchema extends ConnectionCallbackSchema {
	openid_params: OIDConnectionCallbackParams;
}

export type ConnectionAuthCallbackSchema = OAuthConnectionCallbackSchema & OIDConnectionCallbackSchema;
