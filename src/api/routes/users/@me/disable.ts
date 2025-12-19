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
import { User } from "@spacebar/util";
import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        responses: {
            204: {},
            400: {
                body: "APIErrorResponse",
            },
            404: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        const user = await User.findOneOrFail({
            where: { id: req.user_id },
            select: { data: true },
        }); //User object
        let correctpass = true;

        if (user.data.hash) {
            // guest accounts can delete accounts without password
            correctpass = await bcrypt.compare(req.body.password, user.data.hash); //Not sure if user typed right password :/
        }

        if (correctpass) {
            await User.update({ id: req.user_id }, { disabled: true });

            res.sendStatus(204);
        } else {
            res.status(400).json({
                message: "Password does not match",
                code: 50018,
            });
        }
    },
);

export default router;
