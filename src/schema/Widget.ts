// https://discord.com/developers/docs/resources/guild#guild-widget-object
export const WidgetModifySchema = {
	enabled: Boolean, // whether the widget is enabled
	channel_id: String // the widget channel id
};

export interface WidgetModifySchema {
	enabled: boolean; // whether the widget is enabled
	channel_id: string; // the widget channel id
}
