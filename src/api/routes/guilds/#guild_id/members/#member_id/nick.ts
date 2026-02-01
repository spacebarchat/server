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

import { route } from "@spacebar/api";
import { getPermission, Member, PermissionResolvable } from "@spacebar/util";
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

router.patch(
    "/",
    route({
        requestBody: "MemberNickChangeSchema",
        responses: {
            200: {
                body: "APIPublicMember",
            },
            400: {
                body: "APIErrorResponse",
            },
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const { guild_id } = req.params as { [key: string]: string };
        let permissionString: PermissionResolvable = "MANAGE_NICKNAMES";
        const member_id = req.params.member_id === "@me" ? ((permissionString = "CHANGE_NICKNAME"), req.user_id) : (req.params.member_id as string);

        const perms = await getPermission(req.user_id, guild_id);
        perms.hasThrow(permissionString);

        await Member.changeNickname(member_id, guild_id, req.body.nick);

        const member = await Member.findOne({
            where: { id: member_id, guild_id },
            relations: { roles: true },
        });

        res.send(member?.toPublicMember());
    },
);

export default router;
