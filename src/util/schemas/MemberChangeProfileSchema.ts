export interface MemberChangeProfileSchema {
	banner?: string | null;
	nick?: string;
	bio?: string;
	pronouns?: string;

	/*
	 * @items.type integer
	 */
	theme_colors?: [number, number];
}
