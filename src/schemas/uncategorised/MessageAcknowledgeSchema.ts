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

import { z } from "zod";

export const MessageAcknowledgeSchema = z.object({
    token: z.string().optional(),
    manual: z.boolean().optional(),
    mention_count: z.number().optional(),
    flags: z.number().optional(),
    last_viewed: z.number().optional(),
});

export type MessageAcknowledgeSchema = z.infer<typeof MessageAcknowledgeSchema>;

export enum ReadStateType {
    CHANNEL = 0,
    GUILD_EVENT = 1,
    NOTIFICATION_CENTER = 2,
    GUILD_ONBOARDING_QUESTION = 3,
}

export enum ReadStateFlags {
    IS_GUILD_CHANNEL = 1 << 0,
    IS_THREAD = 1 << 1,
}

export const AcknowledgeDeleteSchema = z.object({
    read_state_type: z.enum(ReadStateType).optional(),
    version: z.number().optional(),
});

export type AcknowledgeDeleteSchema = z.infer<typeof AcknowledgeDeleteSchema>;
