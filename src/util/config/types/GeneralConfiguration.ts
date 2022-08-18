import { Snowflake } from "../../util";

export class GeneralConfiguration {
	instanceName = "Fosscord Instance";
	instanceDescription: string | null = "This is a Fosscord instance made in the pre-release days";
	frontPage: string | null = null;
	tosPage: string | null = null;
	correspondenceEmail: string | null = "noreply@localhost.local";
	correspondenceUserID: string | null = null;
	image: string | null = null;
	instanceId: string = Snowflake.generate();
}
