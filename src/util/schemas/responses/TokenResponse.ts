import { UserSettings } from "../../entities";

export interface TokenResponse {
	token: string;
	settings: UserSettings;
}
