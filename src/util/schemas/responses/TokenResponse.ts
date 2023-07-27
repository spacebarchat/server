import { BackupCode, UserSettings } from "../../entities";

export interface TokenResponse {
	token: string;
	settings: UserSettings;
}

export interface TokenOnlyResponse {
	token: string;
}

export interface TokenWithBackupCodesResponse {
	token: string;
	backup_codes: BackupCode[];
}
