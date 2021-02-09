export const Guild = {
	name: String, // ! 2-100 chars
	$region: String, // ? voice region ?
	// $icon: String, // TODO: add icon data (base64 128x128)

	// * --- useless for us due to templates being a thing --- * //
	// $verification_level: Number, // ! https://discord.com/developers/docs/resources/guild#guild-object-verification-level
	// $default_message_notifications: Number, // ! https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
	// $explicit_content_filter: Number,
	// $roles:	array of role objects,
	// $channels:	array of partial channel objects,
	// $afk_channel_id:	snowflake,
	// * --- useless for us --- * //

	// $afk_timeout: Number,
	// $system_channel_id:	snowflake,
};

export interface Guild {
	name: string; // ! 2-100 chars
	region?: string; // ? voice region ?
	// icon?: string; // TODO: add icon data (base64 128x128)

	// * --- useless for us due to templates being a thing --- * //
	// verification_level?: number; // ! https://discord.com/developers/docs/resources/guild#guild-object-verification-level
	// default_message_notifications?: number; // ! https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level
	// explicit_content_filter?: number;
	// $roles:	array of role objects,
	// $channels:	array of partial channel objects,
	// $afk_channel_id:	snowflake,
	// * --- useless for us --- * //

	// afk_timeout?: number;
	// system_channel_id?:	snowflake,
}
