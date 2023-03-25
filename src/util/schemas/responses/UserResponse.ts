import { DmChannelDTO } from "../../dtos";
import { Guild, PrivateUser, PublicUser, User } from "../../entities";

export type PublicUserResponse = PublicUser;
export type PrivateUserResponse = PrivateUser;

export interface UserUpdateResponse extends PrivateUserResponse {
	newToken?: string;
}

export type UserGuildsResponse = Guild[];

export type UserChannelsResponse = DmChannelDTO[];

export interface UserBackupCodesResponse {
	expired: unknown;
	user: User;
	code: string;
	consumed: boolean;
	id: string;
}
[];
