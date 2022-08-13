
export interface ModifyGuildStickerSchema {
	/**
	 * @minLength 2
	 * @maxLength 30
	 */
	name: string;
	/**
	 * @maxLength 100
	 */
	description?: string;
	/**
	 * @maxLength 200
	 */
	tags: string;
}
