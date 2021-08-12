export const RoleModifySchema = {
	$name: String,
	$permissions: BigInt,
	$color: Number,
	$hoist: Boolean, // whether the role should be displayed separately in the sidebar
	$mentionable: Boolean, // whether the role should be mentionable
	$position: Number
};

export interface RoleModifySchema {
	name?: string;
	permissions?: BigInt;
	color?: number;
	hoist?: boolean; // whether the role should be displayed separately in the sidebar
	mentionable?: boolean; // whether the role should be mentionable
	position?: number;
}
