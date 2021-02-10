export const EmojiSchema = {
	name: String, // the name of the emoji
	$id: BigInt, // the id of the emoji
	animated: Boolean, // whether this emoji is animated
};

export interface EmojiSchema {
	name: string;
	id?: bigint;
	animated: Boolean;
}
