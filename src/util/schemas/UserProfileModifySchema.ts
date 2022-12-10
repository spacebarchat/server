export interface UserProfileModifySchema {
	bio?: string;
	accent_color?: number | null;
	banner?: string | null;
	pronouns?: string;
	theme_colors?: string | null  | number[];
}
