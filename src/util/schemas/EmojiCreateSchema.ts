export interface EmojiCreateSchema {
	name?: string;
	image: string;
	require_colons?: boolean | null;
	roles?: string[];
}
