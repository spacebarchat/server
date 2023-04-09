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
import { Member } from "@spacebar/util";
import { route } from "@spacebar/api";

const router = Router();

router.patch(
    "/",
    route({ permission: "MANAGE_ROLES" }),
    async (req: Request, res: Response) => {
        // Payload is JSON containing a list of member_ids, the new list of members to have the role
        const { guild_id, role_id } = req.params;
        const { member_ids } = req.body;
        await Member.IsInGuildOrFail(req.user_id, guild_id);
        const members = await Member.find({
            where: { guild_id },
            relations: ["roles"],
        });
        const members_to_add = members.filter((member) => {
            return member_ids.includes(member.id) && !member.roles.map((role) => role.id).includes(role_id);
        });
        const members_to_remove = members.filter((member) => {
            return !member_ids.includes(member.id) && member.roles.map((role) => role.id).includes(role_id);
        });
        for (const member of members_to_add) {
            Member.addRole(member.id, guild_id, role_id);
        }
        for (const member of members_to_remove) {
            Member.removeRole(member.id, guild_id, role_id);
        }
        res.sendStatus(204);
    }
);

export default router;
