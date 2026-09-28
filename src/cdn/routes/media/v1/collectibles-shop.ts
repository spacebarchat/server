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
import { HTTPError } from "lambert-server/HTTPError";
import { fileTypeFromBuffer } from "file-type";
import { storage, setCacheControl, multer, validateServerAuth } from "../../../util";
import { Config } from "@spacebar/util";
import crypto from "node:crypto";

const ANIMATED_MIME_TYPES = ["image/apng", "image/gif", "image/gifv"];
const STATIC_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/svg"];

const router = Router({ mergeParams: true });

router.get("/:sku_id/static", setCacheControl, async (req: Request, res: Response) => {
    const { sku_id } = req.params as { [key: string]: string };
    const basePath = `collectibles-shop/${sku_id}`;

    let file: Buffer<ArrayBufferLike> | null;
    if (await storage.exists(basePath + "/static")) {
        file = await storage.get(basePath + "/static");
    } else if (await storage.exists(basePath + "/animated")) {
        file = await storage.get(basePath + "/animated");
    } else throw new HTTPError("not found", 404);

    const type = await fileTypeFromBuffer(file!);

    res.set("Content-Type", type?.mime);

    return res.send(file);
});

router.get("/:sku_id/animated", setCacheControl, async (req: Request, res: Response) => {
    const { sku_id } = req.params as { [key: string]: string };
    const basePath = `collectibles-shop/${sku_id}`;

    let file: Buffer<ArrayBufferLike> | null;
    if (await storage.exists(basePath + "/animated")) {
        file = await storage.get(basePath + "/animated");
    } else if (await storage.exists(basePath + "/static")) {
        file = await storage.get(basePath + "/static");
    } else throw new HTTPError("not found", 404);

    const type = await fileTypeFromBuffer(file!);

    res.set("Content-Type", type?.mime);

    return res.send(file);
});

router.post("/:sku_id/animated", validateServerAuth, multer.single("file"), async (req: Request, res: Response) => {
    if (!req.file) throw new HTTPError("Missing file");
    const { buffer, size } = req.file;
    const { sku_id } = req.params as { [key: string]: string };

    let hash = crypto.createHash("md5").update(buffer).digest("hex");

    const type = await fileTypeFromBuffer(buffer);
    if (!type || !ANIMATED_MIME_TYPES.includes(type.mime)) throw new HTTPError("Invalid file type");
    if (ANIMATED_MIME_TYPES.includes(type.mime)) hash = `a_${hash}`; // animated icons have a_ infront of the hash

    const path = `collectibles-shop/${sku_id}/animated`;
    await storage.set(path, buffer);

    return res.json({
        id: sku_id,
        hash: hash,
        content_type: type.mime,
        size,
        url: `${Config.get().cdn.endpointPublic}media/v1/collectibles-shop/${sku_id}/animated`,
    });
});

router.post("/:sku_id/static", validateServerAuth, multer.single("file"), async (req: Request, res: Response) => {
    if (!req.file) throw new HTTPError("Missing file");
    const { buffer, size } = req.file;
    const { sku_id } = req.params as { [key: string]: string };

    const hash = crypto.createHash("md5").update(buffer).digest("hex");

    const type = await fileTypeFromBuffer(buffer);
    if (!type || !STATIC_MIME_TYPES.includes(type.mime)) throw new HTTPError("Invalid file type");

    const path = `collectibles-shop/${sku_id}/static`;
    await storage.set(path, buffer);

    return res.json({
        id: sku_id,
        hash: hash,
        content_type: type.mime,
        size,
        url: `${Config.get().cdn.endpointPublic}media/v1/collectibles-shop/${sku_id}/static`,
    });
});

export default router;
