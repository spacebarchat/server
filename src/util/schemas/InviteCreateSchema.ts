export interface InviteCreateSchema {
	target_user_id?: string;
	target_type?: string;
	validate?: string; // ? what is this
	max_age?: number;
	max_uses?: number;
	temporary?: boolean;
	unique?: boolean;
	target_user?: string;
	target_user_type?: number;
}