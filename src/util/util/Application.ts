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

import { Request } from "express";
import { Application, User } from "../../database/entities";

export async function createAppBotUser(app: Application, req: Request) {
    const user = await User.register({
        username: app.name,
        password: undefined,
        id: app.id,
        req,
        bot: true,
    });

    user.id = app.id;
    user.premium_since = new Date();
    user.bot = true;

    await user.save();

    // flags is NaN here?
    app.assign({ bot: user, flags: app.flags || 0 });

    await app.save();

    return user;
}
