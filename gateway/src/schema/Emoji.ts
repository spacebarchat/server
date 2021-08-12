export const EmojiSchema = {
	name: String, // the name of the emoji
	$id: String, // the id of the emoji
	animated: Boolean, // whether this emoji is animated
};

export interface EmojiSchema {
	name: string;
	id?: string;
	animated: Boolean;
}
