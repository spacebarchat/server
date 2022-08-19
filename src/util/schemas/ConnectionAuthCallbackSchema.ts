export interface ConnectionAuthCallbackSchema {
	code?: string;
	friend_sync: boolean;
	insecure: boolean;
	state?: string;
	openid_params?: {
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
	};
}
