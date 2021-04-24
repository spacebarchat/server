import { DOUBLE_WHITE_SPACE, SPECIAL_CHAR } from "./Regex";

export function trimSpecial(str?: string): string {
	// @ts-ignore
	if (!str) return;
	return str.replace(SPECIAL_CHAR, "").replace(DOUBLE_WHITE_SPACE, " ").trim();
}
