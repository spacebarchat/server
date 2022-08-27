declare global {
	namespace Express {
		interface Request {
			user_id: any;
			token: any;
		}
	}
}

declare module "@puyodead1/openid" {
	export interface OpenIdError {
		message: string;
	}

	export class RelyingParty {
		constructor(realm: string | null, stateless: boolean, strict: boolean, extensions: readonly any[]);

		authenticate(
			identifier: string,
			returnUrl: string,
			immediate: boolean,
			callback: (err: OpenIdError | null, authUrl: string | null) => void
		): void;

		verifyAssertion(
			requestOrUrl: object | string,
			returnUrl: string,
			callback: (err: OpenIdError | null, result?: { authenticated: boolean; claimedIdentifier?: string | undefined }) => void
		): void;

		_verifyAssertionData(
			params: object,
			callback: (err: OpenIdError | null, result?: { authenticated: boolean; claimedIdentifier?: string | undefined }) => void
		);
	}
}
