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
import { RoleMembersUpdateSchema } from "@spacebar/schemas";
import { DiscordApiErrors, Member } from "@spacebar/util";
import { calculateRoleMemberAdditions, calculateRoleMemberReplacement, route } from "@spacebar/api";

const router = Router({ mergeParams: true });
type RoleMemberUpdateMode = "add" | "replace";

const routeOptions = route({
    permission: "MANAGE_ROLES",
    requestBody: "RoleMembersUpdateSchema",
    responses: {
        204: {},
        403: {
            body: "APIErrorResponse",
        },
    },
});

async function updateRoleMembers(req: Request, res: Response, mode: RoleMemberUpdateMode) {
    // Payload is JSON containing a list of member_ids to add (PATCH) or set as the exact role membership (PUT)
    const { guild_id, role_id } = req.params as { [key: string]: string };
    const { member_ids } = req.body as RoleMembersUpdateSchema;

    // don't mess with @everyone
    if (role_id == guild_id) throw DiscordApiErrors.INVALID_ROLE;

    const members = await Member.find({
        where: { guild_id },
        relations: { roles: true },
    });

    const { addMemberIds, removeMemberIds } =
        mode === "replace" ? calculateRoleMemberReplacement(members, member_ids, role_id) : calculateRoleMemberAdditions(members, member_ids, role_id);

    // TODO (erkin): have a bulk add/remove function that adds the roles in a single txn
    await Promise.all([
        ...addMemberIds.map((memberId) => Member.addRole(memberId, guild_id, role_id)),
        ...removeMemberIds.map((memberId) => Member.removeRole(memberId, guild_id, role_id)),
    ]);

    res.sendStatus(204);
}

router.patch("/", routeOptions, (req: Request, res: Response) => updateRoleMembers(req, res, "add"));
router.put("/", routeOptions, (req: Request, res: Response) => updateRoleMembers(req, res, "replace"));

export default router;
