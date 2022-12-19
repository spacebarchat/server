import { Snowflake } from "@fosscord/util";

export class GeneralConfiguration {
	instanceName: string = "Fosscord Instance";
	instanceDescription: string | null = "This is a Fosscord instance made in the pre-release days";
	frontPage: string | null = null;
	tosPage: string | null = null;
	correspondenceEmail: string | null = null;
	correspondenceUserID: string | null = null;
	image: string | null = null;
	instanceId: string = Snowflake.generate();
}