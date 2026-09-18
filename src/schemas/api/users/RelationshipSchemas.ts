/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors
	
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

import { PartialUser, Snowflake } from "@spacebar/schemas";
import { Relation } from "typeorm";

export interface PartialRelationshipSchema {
    id: Snowflake;
    type: RelationshipType;
    nickname: string | null;
    since?: Date;
    stranger_request?: boolean;
    user_ignored: boolean;
}

export type RelationshipListSchema = RelationshipSchema[];
export interface RelationshipSchema {
    id: Snowflake;
    type: RelationshipType;
    user: PartialUser;
    nickname: string | null;
    is_spam_request?: boolean;
    stranger_request?: boolean;
    user_ignored: boolean;
    origin_application_id?: Snowflake | null;
    since?: Date;
    has_played_game?: boolean;
    note?: string;
}

export interface SendRelationshipRequestSchema {
    username: string;
    discriminator: string | null; // null if pomelo
    note?: string | null;
}

export interface RelationshipCreateSchema {
    type?: RelationshipType;
    from_friend_suggestion?: boolean;
    confirm_stranger_request?: boolean;
    note?: string | null;
}

export interface RelationshipModifySchema {
    nickname?: string;
}

export enum RelationshipType {
    CREATE_OR_ACCEPT_REQUEST = -1,
    NONE = 0,
    FRIEND = 1,
    BLOCKED = 2,
    INCOMING_REQUEST = 3,
    OUTGOING_REQUEST = 4,
    IMPLICIT = 5,
    // @deprecated
    SUGGESTION = 6,
}

export interface UserMutualRelationResponse {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
    public_flags: number;
}

export type UserMutualRelationsResponse = UserMutualRelationResponse[];
