/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { GuildBansResponse, GuildCreateResponse } from "@spacebar/util";
import { GeneralConfiguration, LimitsConfiguration } from "../../util/config";
import { DmChannelDTO } from "../../util/dtos";
import {
	Application,
	BackupCode,
	Categories,
	Channel,
	Emoji,
	Guild,
	Invite,
	Member,
	Message,
	PrivateUser,
	PublicMember,
	PublicUser,
	Role,
	Sticker,
	StickerPack,
	Template,
	Webhook,
} from "../../util/entities";
import { GuildVoiceRegion } from "./GuildVoiceRegionsResponse";

// removes internal properties from the guild class
export type APIGuild = Omit<
	Guild,
	| "afk_channel"
	| "template"
	| "owner"
	| "public_updates_channel"
	| "rules_channel"
	| "system_channel"
	| "widget_channel"
>;

export type APIPublicUser = PublicUser;
export type APIPrivateUser = PrivateUser;

export type APIGuildArray = APIGuild[];

export type APIDMChannelArray = DmChannelDTO[];

export type APIBackupCodeArray = BackupCode[];

export interface UserUpdateResponse extends APIPrivateUser {
	newToken?: string;
}

export type ApplicationDetectableResponse = unknown[];

export type ApplicationEntitlementsResponse = unknown[];

export type ApplicationSkusResponse = unknown[];

export type APIApplicationArray = Application[];

export type APIBansArray = GuildBansResponse[];

export type APIInviteArray = Invite[];

export type APIMessageArray = Message[];

export type APIWebhookArray = Webhook[];

export type APIDiscoveryCategoryArray = Categories[];

export type APIGeneralConfiguration = GeneralConfiguration;

export type APIChannelArray = Channel[];

export type APIEmojiArray = Emoji[];

export type APIMemberArray = Member[];
export type APIPublicMember = PublicMember;

export interface APIGuildWithJoinedAt extends GuildCreateResponse {
	joined_at: string;
}

export type APIRoleArray = Role[];

export type APIStickerArray = Sticker[];

export type APITemplateArray = Template[];

export type APIGuildVoiceRegion = GuildVoiceRegion[];

export type APILimitsConfiguration = LimitsConfiguration;

export type APIStickerPackArray = StickerPack[];

export type APIConnectionsConfiguration = Record<
	string,
	{
		enabled: boolean;
	}
>;
