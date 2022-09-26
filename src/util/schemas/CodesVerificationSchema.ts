export interface CodesVerificationSchema {
	key: string;
	nonce: string;
	regenerate?: boolean;
}
