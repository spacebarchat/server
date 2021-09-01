// https://discord.com/developers/docs/resources/emoji

export const EmojiCreateSchema = {
	name: String, //name of the emoji
	image: String, // image data the 128x128 emoji image uri
	$roles: Array //roles allowed to use this emoji
};

export interface EmojiCreateSchema {
	name: string; // name of the emoji
	image: string; // image data the 128x128 emoji image uri
	roles?: string[]; //roles allowed to use this emoji
}
