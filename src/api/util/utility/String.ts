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

import { Request } from "express";
import { ntob } from "./Base64";
import { FieldErrors } from "@fosscord/util";

export function checkLength(
	str: string,
	min: number,
	max: number,
	key: string,
	req: Request,
) {
	if (str.length < min || str.length > max) {
		throw FieldErrors({
			[key]: {
				code: "BASE_TYPE_BAD_LENGTH",
				message: req.t("common:field.BASE_TYPE_BAD_LENGTH", {
					length: `${min} - ${max}`,
				}),
			},
		});
	}
}

export function generateCode() {
	return ntob(Date.now() + Math.randomIntBetween(0, 10000));
}
