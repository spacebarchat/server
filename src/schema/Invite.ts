export const InviteCreateSchema = {
	$max_age: Number,
	$max_uses: Number,
	$temporary: Boolean,
	$unique: Boolean,
	$target_user: String,
	$target_user_type: Number,
};
export interface InviteCreateSchema {
	max_age?: Number;
	max_uses?: Number;
	temporary?: Boolean;
	unique?: Boolean;
	target_user?: String;
	target_user_type?: Number;
}
