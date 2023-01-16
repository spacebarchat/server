/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

export class ApiError extends Error {
	constructor(
		readonly message: string,
		public readonly code: number,
		public readonly httpStatus: number = 400,
		public readonly defaultParams?: string[],
	) {
		super(message);
	}

	withDefaultParams(): ApiError {
		if (this.defaultParams)
			return new ApiError(
				applyParamsToString(this.message, this.defaultParams),
				this.code,
				this.httpStatus,
			);
		return this;
	}

	withParams(...params: (string | number)[]): ApiError {
		return new ApiError(
			applyParamsToString(this.message, params),
			this.code,
			this.httpStatus,
		);
	}
}

export function applyParamsToString(
	s: string,
	params: (string | number)[],
): string {
	let newString = s;
	params.forEach((a) => {
		newString = newString.replace("{}", "" + a);
	});
	return newString;
}
