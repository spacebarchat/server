export interface UserProfileModifySchema {
	bio?: string;
	accent_color?: number | null;
	banner?: string | null;
	pronouns?: string;

	/*
	* @items.type integer
	*/
	theme_colors?: [number, number]
}
