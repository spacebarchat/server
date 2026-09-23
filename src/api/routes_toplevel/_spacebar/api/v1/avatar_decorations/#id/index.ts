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

import { Router, Response, Request } from "express";
import { route } from "@spacebar/api/middlewares";
import { AvatarDecoration } from "@spacebar/database";
import { PublicAvatarDecorationResponse, UpdateAvatarDecorationSchema } from "@spacebar/schemas/api/spacebar/AvatarDecorations";
import { ApiError } from "@spacebar/util";

const router = Router({ mergeParams: true });

router.patch(
    "/",
    route({
        spacebarOnly: true,
        description: "Get available avatar decorations",
        requestBody: "UpdateAvatarDecorationSchema",
        responses: {
            200: {
                body: "PublicAvatarDecorationListResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const changes = req.body as UpdateAvatarDecorationSchema;
        const deco = await AvatarDecoration.findOneOrFail({ where: { id: req.params.id as string } });

        if (deco.uploader_id !== req.user_id) throw new ApiError("You do not have permission to update this avatar decoration", 0, 403);

        if (changes.public !== undefined) deco.public = changes.public;
        if (changes.allowed_user_ids) {
            if (changes.allowed_user_ids.add) deco.allowed_user_ids.push(...changes.allowed_user_ids.add);
            if (changes.allowed_user_ids.remove) deco.allowed_user_ids = deco.allowed_user_ids.filter((x) => !changes.allowed_user_ids!.remove!.includes(x));
        }
        if (changes.allowed_guild_ids) {
            if (changes.allowed_guild_ids.add) deco.allowed_user_ids.push(...changes.allowed_guild_ids.add);
            if (changes.allowed_guild_ids.remove) deco.allowed_user_ids = deco.allowed_user_ids.filter((x) => !changes.allowed_guild_ids!.remove!.includes(x));
        }
        if (changes.allowed_role_ids) {
            if (changes.allowed_role_ids.add) deco.allowed_user_ids.push(...changes.allowed_role_ids.add);
            if (changes.allowed_role_ids.remove) deco.allowed_user_ids = deco.allowed_user_ids.filter((x) => !changes.allowed_role_ids!.remove!.includes(x));
        }

        // TODO: remove avatar from users that no longer have access to them

        res.json(deco.toPublicAvatarDecoration() satisfies PublicAvatarDecorationResponse);
    },
);

export default router;
