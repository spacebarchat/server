export interface ConnectionCallbackSchema {
	code?: string;
	state: string;
	insecure: boolean;
	friend_sync: boolean;
	openid_params?: any; // TODO: types
}
