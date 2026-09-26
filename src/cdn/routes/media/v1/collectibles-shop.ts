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
import { storage, setCacheControl } from "../../../util";

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

export default router;
