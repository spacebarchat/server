/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors
	
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
import { Config, Snowflake } from "@spacebar/util";
import { fileTypeFromBuffer } from "file-type";
import { HTTPError } from "lambert-server";
import crypto from "crypto";
import { storage, multer, ANIMATED_MIME_TYPES, STATIC_MIME_TYPES } from "../util";

// TODO: check premium and animated pfp are allowed in the config
// TODO: generate different sizes of icon
// TODO: generate different image types of icon
// TODO: delete old icons

const ALLOWED_MIME_TYPES = [...ANIMATED_MIME_TYPES, ...STATIC_MIME_TYPES];

export class BasicCrdFileRouterOptions {
    public pathPrefix: string;
    public fallbackToAvatarPath: boolean = true;

    constructor(data: Partial<BasicCrdFileRouterOptions> = {}) {
        Object.assign(this, data);
    }
}

export function createBasicCrdFileRouter(opts: BasicCrdFileRouterOptions) {
    const router = Router({ mergeParams: true });
    console.log("Creating Basic CRD File Router with opts:", JSON.stringify(opts));

    router.post("/:user_id", multer.single("file"), async (req: Request, res: Response) => {
        if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");
        if (!req.file) throw new HTTPError("Missing file");
        const { buffer, size } = req.file;
        const { user_id } = req.params;

        let hash = crypto.createHash("md5").update(Snowflake.generate()).digest("hex");

        const type = await fileTypeFromBuffer(buffer);
        if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) throw new HTTPError("Invalid file type");
        if (ANIMATED_MIME_TYPES.includes(type.mime)) hash = `a_${hash}`; // animated icons have a_ infront of the hash

        const path = `${opts.pathPrefix}/${user_id}/${hash}`;
        const endpoint = Config.get().cdn.endpointPublic;

        await storage.set(path, buffer);

        return res.json({
            id: hash,
            content_type: type.mime,
            size,
            url: `${endpoint}${req.baseUrl}/${user_id}/${hash}`,
        });
    });

    router.get("/:user_id", async (req: Request, res: Response) => {
        let { user_id } = req.params;
        user_id = user_id.split(".")[0]; // remove .file extension
        const path = `${opts.pathPrefix}/${user_id}`;

        const file = await storage.get(path);
        if (!file) throw new HTTPError("not found", 404);
        const type = await fileTypeFromBuffer(file);

        res.set("Content-Type", type?.mime);
        res.set("Cache-Control", "public, max-age=31536000");

        return res.send(file);
    });

    const getAvatar = async (req: Request, res: Response) => {
        const { user_id } = req.params;
        let { hash } = req.params;
        hash = hash.split(".")[0]; // remove .file extension
        const path = `${opts.pathPrefix}/${user_id}/${hash}`;

        const file = await storage.get(path);
        if (!file) throw new HTTPError("not found", 404);
        const type = await fileTypeFromBuffer(file);

        res.set("Content-Type", type?.mime);
        res.set("Cache-Control", "public, max-age=31536000");

        return res.send(file);
    };

    router.get("/:user_id/:hash", getAvatar);

    router.delete("/:user_id/:hash", async (req: Request, res: Response) => {
        if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");
        const { user_id, hash } = req.params;
        const path = `${opts.pathPrefix}/${user_id}/${hash}`;

        await storage.delete(path);

        return res.send({ success: true });
    });

    return router;
}
