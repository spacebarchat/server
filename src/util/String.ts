export const DOUBLE_WHITE_SPACE = /\s\s+/g;
export const SPECIAL_CHAR = /[@#`:\r\n\t\f\v\p{C}]/gu;

export function trimSpecial(str: string) {
	return str.replace(SPECIAL_CHAR, "").replace(DOUBLE_WHITE_SPACE, " ").trim();
}
