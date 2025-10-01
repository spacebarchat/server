/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
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

import { MemberNameType } from "@typescript-eslint/eslint-plugin/dist/util";
import { Attachment } from "../../entities";

export enum AccountStandingState {
	ALL_GOOD = 100,
	LIMITED = 200,
	VERY_LIMITED = 300,
	AT_RISK = 400,
	SUSPENDED = 500,
}

export enum AppealEligibility {
	DSA_ELIGIBLE = 1,
	IN_APP_ELIGIBLE = 2,
	AGE_VERIFY_ELIGIBLE = 3,
}

export enum ClassificationType {
	UNKNOWN = 1,
	UNSOLICITED_PORNOGRAPHY = 100,
	NONCONSENSUAL_PORNOGRAPHY = 200,
	GLORIFYING_VIOLENCE = 210,
	HATE_SPEECH = 220,
	CRACKED_ACCOUNTS = 230,
	ILLICIT_GOODS = 240,
	SOCIAL_ENGINEERING = 250,
	CHILD_SAFETY = 280,
	HARRASMENT_AND_BULLYING = 290,
	HARRASMENT_AND_BULLYING_2 = 310,
	HATEFUL_CONDUCT = 320,
	HARRASMENT_AND_BULLYING_3 = 390,
	CHILD_SAFETY_2 = 600,
	CHILD_SAFETY_3 = 650,
	IMPERSONATION = 711,
	BAN_EVASION = 720,
	MALICIOUS_CONDUCT = 3010,
	SPAM = 3030,
	NONCONSENSUAL_ADULT_CONTENT = 4000,
	FRAUD = 4010,
	DOXXING_GUILD_OWNER = 4130,
	COPYRIGHT_INFRINGEMENT_GUILD_OWNER = 4140,
	CHILD_SAFETY_4 = 5010,
	CHILD_SELF_ENDANGERMENT = 5090,
	DOXXING_GUILD_MEMBER = 5305,
	UNDERAGE = 5411,
	COPYRIGHT_INFRINGEMENT_GUILD_MEMBER = 5440,
	COPYRIGHT_INFRINGEMENT_3 = 5485,
}

export enum AppealIngestionType {
	WEBFORM = 0,
	AGE_VERIFY = 1,
	IN_APP = 2,
}

export enum ClassificationActionType {
	BAN = 0,
	TEMP_BAN = 1,
	GLOBAL_QUARANTINE = 2,
	REQUIRE_VERIFICATION = 3,
	USER_WARNING = 4,
	USER_SPAMMER = 5,
	CHANNEL_SPAM = 6,
	MESSAGE_SPAM = 7,
	DISABLE_SUSPICIOUS_ACTIVITY = 8,
	LIMITED_ACCESS = 9,
	CHANNEL_SCHEDULE_DELETE = 10,
	MESSAGE_CONTENT_REMOVAL = 11,
	GUILD_DISABLE_INVITE = 12,
	USER_CONTENT_REMOVAL = 13,
	USER_USERNAME_MANGLED = 14,
	GUILD_LIMITED_ACCESS = 15,
	USER_MESSAGE_REMOVAL = 16,
	GUILD_DELETE = 20,
	USER_PROFILE_MANGLED = 22,
}

export interface ClassificationAction {
	id: string;
	action_type: ClassificationActionType;
	descriptions: string[];
}

export enum AppealStatusValue {
	REVIEW_PENDING = 1,
	CLASSIFICATION_UPHELD = 2,
	CLASSIFICATION_INVALIDATED = 3,
}

export interface AppealStatus {
	status: AppealStatusValue;
}

// why is this just a reduced message?
export interface FlaggedContent {
	type: "message";
	id: string;
	content: string;
	attachments: Attachment[];
}

export interface Classification {
	id: string;
	classification_type: ClassificationType;
	description: string;
	explainer_link: string;
	actions: ClassificationAction[];
	max_expiration_time: string; // ISO 8601 timestamp
	flagged_content: unknown[]; // TODO
	appeal_status: AppealStatus;
	is_coppa: boolean;
	is_spam: boolean;
	appeal_ingestion_type: AppealIngestionType;
}

export enum GuildMemberType {
	OWNER = 1,
	MEMBER = 2
}

export interface GuildMetadata {
	name: string;
	icon?: string;
	member_type: GuildMemberType;
}

export interface GuildClassification extends Classification {
	guild_metadata: GuildMetadata;
}

export interface AccountStandingResponse {
	classifications: Classification[];
	guild_classifications: GuildClassification[];
	account_standing: {
		state: AccountStandingState;
	};
	is_dsa_eligible: boolean;
	username: string;
	discriminator: string; // Not sure if this is even valid, we don't have any examples of pre-pomelo users
	is_appeal_eligible: boolean;
	appeal_eligibility: AppealEligibility[];
}
