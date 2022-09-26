export interface RoleModifySchema {
	name?: string;
	permissions?: string;
	color?: number;
	hoist?: boolean; // whether the role should be displayed separately in the sidebar
	mentionable?: boolean; // whether the role should be mentionable
	position?: number;
	icon?: string;
	unicode_emoji?: string;
}