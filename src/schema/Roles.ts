export const RoleCreateSchema = {
	name: String,
	permissions: String,
	color: Number, 
	hoist: Boolean, // whether the role should be displayed separately in the sidebar
	mentionable: Boolean // whether the role should be mentionable
};

export interface RoleCreateSchema {
	name: string,
	permissions: string,
	color: number,
	hoist: boolean, // whether the role should be displayed separately in the sidebar
	mentionable: boolean // whether the role should be mentionable
}
