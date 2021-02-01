export const WHITE_SPACE = /\s\s+/g;
export const SPECIAL_CHAR = /[@#`:\r\n\t\f\v\p{C}]/gu;

export function trim(str: string) {
	return str.replace(SPECIAL_CHAR, "").replace(WHITE_SPACE, " ").trim();
}
