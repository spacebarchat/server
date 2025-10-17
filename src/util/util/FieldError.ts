/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
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

import { ErrorObject } from "ajv";

export interface FieldErrorResponse {
	code: number;
	message: string;
	errors: Record<string, ObjectErrorContent>;
}

export type ErrorContent = { code: string; message: string };
export type ObjectErrorContent = { _errors: ErrorContent[] };

export function FieldErrors(fields: Record<string, { code?: string; message: string }>, errors?: ErrorObject[]) {
	return new FieldError(
		50035,
		"Invalid Form Body",
		fields.map<ErrorContent, ObjectErrorContent>(({ message, code }) => ({
			_errors: [
				{
					message,
					code: code || "BASE_TYPE_INVALID",
				},
			],
		})),
		errors
	);
}

// TODO: implement Image data type: Data URI scheme that supports JPG, GIF, and PNG formats. An example Data URI format is: data:image/jpeg;base64,BASE64_ENCODED_JPEG_IMAGE_DATA
// Ensure you use the proper content type (image/jpeg, image/png, image/gif) that matches the image data being provided.

export class FieldError extends Error {
	constructor(
		public code: string | number,
		public message: string,
		public errors?: object, // TODO: I don't like this typing.
		public _ajvErrors?: ErrorObject[]
	) {
		super(message);
	}
}
