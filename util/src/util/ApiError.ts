export class ApiError extends Error {
	constructor(
		readonly message: string,
		public readonly code: number,
		public readonly httpStatus: number = 400,
		public readonly defaultParams?: string[]
	) {
		super(message);
	}

	withDefaultParams(): ApiError {
		if (this.defaultParams)
			return new ApiError(applyParamsToString(this.message, this.defaultParams), this.code, this.httpStatus);
		return this;
	}

	withParams(...params: (string | number)[]): ApiError {
		return new ApiError(applyParamsToString(this.message, params), this.code, this.httpStatus);
	}
}

export function applyParamsToString(s: string, params: (string | number)[]): string {
	let newString = s;
	params.forEach((a) => {
		newString = newString.replace("{}", "" + a);
	});
	return newString;
}
