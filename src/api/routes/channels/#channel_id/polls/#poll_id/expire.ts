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

import { Request, Response, Router } from "express";
import { route } from "@spacebar/api/util/handlers/route";
import { Message } from "#database";
import { DiscordApiErrors, emitEvent, MessageUpdateEvent } from "#util";

const router: Router = Router({ mergeParams: true });

router.post("/", route({ permission: "VIEW_CHANNEL" }), async (req: Request, res: Response) => {
    const { poll_id, channel_id } = req.params as { [key: string]: string };

    const message = await Message.findOne({ where: { id: poll_id } });

    if (!message) {
        throw DiscordApiErrors.UNKNOWN_MESSAGE;
    }

    if (!message.poll) {
        throw DiscordApiErrors.NON_POLL_MESSAGE_CANNOT_EXPIRE;
    }

    if (new Date() > new Date(message.poll.expiry)) {
        throw DiscordApiErrors.POLL_EXPIRED;
    }

    message.poll.expiry = new Date();

    await message.save();
    res.send(message);

    await emitEvent({
        channel_id,
        data: message.toJSON(),
        event: "MESSAGE_UPDATE",
    } satisfies MessageUpdateEvent);
});

export default router;
