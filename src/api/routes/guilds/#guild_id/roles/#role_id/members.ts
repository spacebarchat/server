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

import { Router, Request, Response } from "express";
import { DiscordApiErrors, Member } from "@spacebar/util";
import { route } from "@spacebar/api";
import { HTTPError } from "lambert-server";
import { In } from "typeorm";
import { getMissingRoleMemberIds, getRoleMemberIdsToAdd, normalizeRoleMemberPatchIds } from "../../../../../util/utility/RoleMembers";

const router = Router({ mergeParams: true });

router.patch("/", route({ permission: "MANAGE_ROLES" }), async (req: Request, res: Response) => {
    // Payload is JSON containing a list of member_ids to add to the role.
    const { guild_id, role_id } = req.params as { [key: string]: string };

    // don't mess with @everyone
    if (role_id == guild_id) throw DiscordApiErrors.INVALID_ROLE;

    let member_ids: string[];
    try {
        member_ids = normalizeRoleMemberPatchIds(req.body?.member_ids);
    } catch (error) {
        throw new HTTPError(error instanceof Error ? error.message : "Invalid member_ids", 400);
    }

    if (member_ids.length === 0) return res.sendStatus(204);

    const members = await Member.find({
        where: { guild_id, id: In(member_ids) },
        relations: { roles: true },
    });

    const memberSnapshots = members.map((member) => ({ id: member.id, role_ids: member.roles.map((role) => role.id) }));
    const missingMemberIds = getMissingRoleMemberIds(memberSnapshots, member_ids);
    if (missingMemberIds.length > 0) throw DiscordApiErrors.UNKNOWN_MEMBER;

    const add = getRoleMemberIdsToAdd(memberSnapshots, member_ids, role_id);

    // TODO (erkin): have a bulk add/remove function that adds the roles in a single txn
    await Promise.all(add.map((member_id) => Member.addRole(member_id, guild_id, role_id)));

    res.sendStatus(204);
});

export default router;
