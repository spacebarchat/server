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

import crypto from "node:crypto";
import fs from "node:fs/promises";
import { Router, Response, Request } from "express";
import { fileTypeFromBuffer } from "file-type";
import { route } from "@spacebar/api";
import { storage, FileStorage } from "@spacebar/cdn";
import { Message, User, Webhook } from "@spacebar/database";

const ANIMATED_MIME_TYPES = ["image/apng", "image/gif", "image/gifv"];
const STATIC_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/svg"];

const router = Router({ mergeParams: true });

router.post(
    "/",
    route({
        right: "OPERATOR",
        responses: {
            200: {},
            403: {
                body: "APIErrorResponse",
            },
        },
    }),
    async (req: Request, res: Response) => {
        // if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");
        const { user_id } = req.params as { [key: string]: string };

        if (!(storage instanceof FileStorage)) return res.status(500).send("S3 storage isn't currently supported by this endpoint");
        if (!(await storage.exists(`avatars/${user_id}`))) return res.status(404).send("No such user");

        res.writeHead(200);
        const dirs = await fs.readdir(storage.getFsPath(`avatars/${user_id}`));
        for (const dirEnt of dirs) {
            console.log(dirEnt);
            res.write(`Found dirEnt: ${dirEnt}...`);
            const buffer = await fs.readFile(storage.getFsPath(`avatars/${user_id}/${dirEnt}`));
            let hash = crypto.createHash("md5").update(buffer).digest("hex");

            const type = await fileTypeFromBuffer(buffer);
            if (ANIMATED_MIME_TYPES.includes(type?.mime ?? "")) hash = `a_${hash}`; // animated icons have a_ infront of the hash

            res.write(` Read file, correct hash: ${hash}, type: ${type?.mime}...`);

            if (dirEnt != hash) {
                // update any references
                const messages = await Message.find({ where: { author_id: user_id, avatar: dirEnt } });
                if (messages.length > 0) {
                    res.write(" Updating message refs");
                    for (const message of messages) {
                        message.avatar = hash;
                        await message.save();
                        res.write(".");
                    }
                }

                const user = await User.findOne({ where: { id: user_id, avatar: dirEnt } });
                if (user) {
                    res.write(" Updating user ref...");
                    user.avatar = hash;
                    await user.save();
                }

                const webhook = await Webhook.findOne({ where: { id: user_id, avatar: dirEnt } });
                if (webhook) {
                    res.write(" Updating webhook ref...");
                    webhook.avatar = hash;
                    await webhook.save();
                }

                res.write(" Moving file...");
                await storage.move(`avatars/${user_id}/${dirEnt}`, `avatars/${user_id}/${hash}`);
            }

            res.write("\n");
        }

        return res.end();
    },
);

export default router;
