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

import type { ApplicationCommandCreateSchema } from "../../../schemas/api/bots/ApplicationCommandCreateSchema";
import type { ApplicationCommandSchema } from "../../../schemas/api/bots/ApplicationCommandSchema";
import type { ApplicationCommand } from "../../../util/entities/ApplicationCommand";
import { FieldErrors } from "../../../util/util/FieldError";
import { Snowflake } from "../../../util/util/Snowflake";
import { FindOptionsWhere, IsNull } from "typeorm";

export type ApplicationCommandScope = {
    applicationId: string;
    guildId?: string;
};

export function applicationCommandScopeWhere(scope: ApplicationCommandScope): FindOptionsWhere<ApplicationCommand> {
    return {
        application_id: scope.applicationId,
        guild_id: scope.guildId ?? IsNull(),
    };
}

export function applicationCommandNameWhere(scope: ApplicationCommandScope, name: string): FindOptionsWhere<ApplicationCommand> {
    return {
        ...applicationCommandScopeWhere(scope),
        name,
    };
}

export function applicationCommandIdWhere(scope: ApplicationCommandScope, commandId: string): FindOptionsWhere<ApplicationCommand> {
    return {
        ...applicationCommandScopeWhere(scope),
        id: commandId,
    };
}

export function normalizeApplicationCommandName(name: string) {
    const trimmedName = name.trim();

    if (trimmedName.length < 1 || trimmedName.length > 32) {
        // TODO: configurable?
        throw FieldErrors({
            name: {
                code: "BASE_TYPE_BAD_LENGTH",
                message: `Must be between 1 and 32 in length.`,
            },
        });
    }

    return trimmedName;
}

export function buildApplicationCommand(scope: ApplicationCommandScope, body: ApplicationCommandCreateSchema): ApplicationCommandSchema {
    body.type ??= 1;

    return {
        application_id: scope.applicationId,
        guild_id: scope.guildId,
        name: normalizeApplicationCommandName(body.name),
        name_localizations: body.name_localizations,
        description: body.description?.trim() || "",
        description_localizations: body.description_localizations,
        default_member_permissions: body.default_member_permissions || null,
        contexts: body.contexts,
        dm_permission: body.dm_permission ?? true,
        global_popularity_rank: 1,
        handler: body.handler,
        integration_types: body.integration_types,
        nsfw: body.nsfw,
        options: body.options,
        type: body.type,
        version: Snowflake.generate(),
    };
}
