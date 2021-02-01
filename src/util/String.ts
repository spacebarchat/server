import { Request } from "express";
import { FieldError, FieldErrors } from "./instanceOf";

export const DOUBLE_WHITE_SPACE = /\s\s+/g;
export const SPECIAL_CHAR = /[@#`:\r\n\t\f\v\p{C}]/gu;

export function trimSpecial(str: string) {
	return str.replace(SPECIAL_CHAR, "").replace(DOUBLE_WHITE_SPACE, " ").trim();
}

export function checkLength(str: string, min: number, max: number, key: string, req: Request) {
	if (str.length < min || str.length > max) {
		throw FieldErrors({
			[key]: {
				code: "BASE_TYPE_BAD_LENGTH",
				message: req.t("common:field.BASE_TYPE_BAD_LENGTH", { length: `${min} - ${max}` }),
			},
		});
	}
}
