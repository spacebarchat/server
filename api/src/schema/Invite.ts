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
	target_user_id?: string;
	target_type?: string;
	validate?: string; //? wtf is this
	max_age?: number;
	max_uses?: number;
	temporary?: boolean;
	unique?: boolean;
	target_user?: string;
	target_user_type?: number;
}
