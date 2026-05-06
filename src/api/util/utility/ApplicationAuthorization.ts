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

import { TeamMemberRole, TeamMemberState } from "../../../schemas/api/developers/Team";
import { DiscordApiErrors } from "../../../util/util/Constants";

export type ApplicationCommandAuthorizationMember = {
    user_id?: string | null;
    membership_state: TeamMemberState;
    role: TeamMemberRole;
};

export type ApplicationCommandAuthorizationTarget = {
    owner?: { id?: string | null } | null;
    bot?: { id?: string | null } | null;
    team?: {
        owner_user_id?: string | null;
        members?: ApplicationCommandAuthorizationMember[] | null;
    } | null;
};

const applicationCommandManagementRoles = new Set<TeamMemberRole>([TeamMemberRole.ADMIN, TeamMemberRole.DEVELOPER]);

export type ApplicationCommandAuthorizationRepository = {
    findOne(options: unknown): Promise<ApplicationCommandAuthorizationTarget | null>;
};

async function getApplicationCommandAuthorizationRepository(): Promise<ApplicationCommandAuthorizationRepository> {
    const { Application } = await import("../../../util/entities/Application.js");
    return Application as ApplicationCommandAuthorizationRepository;
}

export function canManageApplicationCommands(application: ApplicationCommandAuthorizationTarget, userId: string) {
    if (application.bot?.id === userId) return true;
    if (application.owner?.id === userId) return true;

    const team = application.team;
    if (!team) return false;

    if (team.owner_user_id === userId) return true;

    return (
        team.members?.some((member) => member.user_id === userId && member.membership_state === TeamMemberState.ACCEPTED && applicationCommandManagementRoles.has(member.role)) ??
        false
    );
}

export async function requireApplicationCommandManagement(applicationId: string, userId: string, repository?: ApplicationCommandAuthorizationRepository) {
    const applicationRepository = repository ?? (await getApplicationCommandAuthorizationRepository());
    const application = await applicationRepository.findOne({
        where: { id: applicationId },
        relations: {
            owner: true,
            bot: true,
            team: {
                members: true,
            },
        },
    });

    if (!application) throw DiscordApiErrors.UNKNOWN_APPLICATION;
    if (!canManageApplicationCommands(application, userId)) throw DiscordApiErrors.ACTION_NOT_AUTHORIZED_ON_APPLICATION;

    return application;
}
