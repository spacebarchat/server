export const TemplateCreateSchema = {
	name: String,
	$description: String,

};

export interface TemplateCreateSchema {
	name: string,
	description?: string,
}

export const TemplateModifySchema = {
	name: String,
	$description: String,

};

export interface TemplateModifySchema {
	name: string,
	description?: string,
}
