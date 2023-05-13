import { TokenResponse } from "./responses";

export interface MFAResponse {
	ticket: string;
	mfa: true;
	sms: false; // TODO
	token: null;
}

export interface WebAuthnResponse extends MFAResponse {
	webauthn: string;
}

export type LoginResponse = TokenResponse | MFAResponse | WebAuthnResponse;
