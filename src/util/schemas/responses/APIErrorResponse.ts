export interface APIErrorResponse {
	code: number;
	message: string;
	errors: {
		[key: string]: {
			_errors: {
				message: string;
				code: string;
			}[];
		};
	};
}
