import { Snowflake } from "../../util";

export interface GuildWidgetSettingsResponse {
	enabled: boolean;
	channel_id: Snowflake | null;
}
