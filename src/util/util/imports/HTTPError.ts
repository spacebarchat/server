export class HTTPError extends Error {
	constructor(message: string, public code: number = 400, public data: any = null) {
		super(message);
	}
}
