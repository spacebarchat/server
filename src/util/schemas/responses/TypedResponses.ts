import { GeneralConfiguration, LimitsConfiguration } from "../../config";
import { DmChannelDTO } from "../../dtos";
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
	PublicUser,
	Role,
	Sticker,
	StickerPack,
	Template,
	Webhook,
} from "../../entities";
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

export type APIInviteArray = Invite[];

export type APIMessageArray = Message[];

export type APIWebhookArray = Webhook[];

export type APIDiscoveryCategoryArray = Categories[];

export type APIGeneralConfiguration = GeneralConfiguration;

export type APIChannelArray = Channel[];

export type APIEmojiArray = Emoji[];

export type APIMemberArray = Member[];

export interface APIGuildWithJoinedAt extends Guild {
	joined_at: string;
}

export type APIRoleArray = Role[];

export type APIStickerArray = Sticker[];

export type APITemplateArray = Template[];

export type APIGuildVoiceRegion = GuildVoiceRegion[];

export type APILimitsConfiguration = LimitsConfiguration;

export type APIStickerPackArray = StickerPack[];
