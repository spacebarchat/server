import { DmChannelDTO } from "../../dtos";
import { BackupCode, Guild, PrivateUser, PublicUser } from "../../entities";

export type PublicUserResponse = PublicUser;
export type PrivateUserResponse = PrivateUser;

export interface UserUpdateResponse extends PrivateUserResponse {
	newToken?: string;
}

export type UserGuildsResponse = Guild[];

export type UserChannelsResponse = DmChannelDTO[];

export type UserBackupCodesResponse = BackupCode[];
