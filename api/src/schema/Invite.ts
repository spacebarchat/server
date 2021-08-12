export const InviteCreateSchema = {
	$target_user_id: String,
	$target_type: String,
	$validate: String, //? wtf is this
	$max_age: Number,
	$max_uses: Number,
	$temporary: Boolean,
	$unique: Boolean,
	$target_user: String,
	$target_user_type: Number
};
export interface InviteCreateSchema {
	target_user_id?: String;
	target_type?: String;
	validate?: String; //? wtf is this
	max_age?: Number;
	max_uses?: Number;
	temporary?: Boolean;
	unique?: Boolean;
	target_user?: String;
	target_user_type?: Number;
}
