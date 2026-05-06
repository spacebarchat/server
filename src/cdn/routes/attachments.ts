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

import { Config, hasValidSignature, NewUrlUserSignatureData, Snowflake, UrlSignResult } from "@spacebar/util";
import { Request, Response, Router } from "express";
import imageSize from "image-size";
import { HTTPError } from "lambert-server";
import { multer } from "../util/multer";
import { storage } from "@spacebar/cdn";
import { fileTypeFromBuffer } from "file-type";
import { cache } from "../util/cache";

const router = Router({ mergeParams: true });

const SANITIZED_CONTENT_TYPE = ["text/html", "text/mhtml", "multipart/related", "application/xhtml+xml"];

router.post("/:channel_id/:message_id", multer.single("file"), async (req: Request, res: Response) => {
    if (req.headers.signature !== Config.get().security.requestSignature)
        throw new HTTPError(`Invalid request signature, expected '${Config.get().security.requestSignature}', got ${req.headers.signature}`);

    if (!req.file) throw new HTTPError("file missing");

    const { buffer, mimetype, size, originalname } = req.file;
    const { channel_id, message_id } = req.params as { [key: string]: string };
    const filename = originalname.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._]+/g, "");
    const path = `attachments/${channel_id}/${message_id}/${filename}`;

    const endpoint = Config.get()?.cdn.endpointPublic;

    await storage.set(path, buffer);
    let width;
    let height;
    if (mimetype.includes("image")) {
        const dimensions = imageSize(buffer);
        if (dimensions) {
            width = dimensions.width;
            height = dimensions.height;
        }
    }

    const finalUrl = `${endpoint}/${path}`;

    const file = {
        id: Snowflake.generate(),
        channel_id,
        message_id,
        content_type: mimetype,
        filename: filename,
        size,
        url: finalUrl,
        path,
        width,
        height,
    };

    return res.json(file);
});

router.get("/:channel_id/:message_id/:filename", cache, async (req: Request, res: Response) => {
    const { channel_id, message_id, filename } = req.params as { [key: string]: string };
    // const { format } = req.query;

    const path = `attachments/${channel_id}/${message_id}/${filename}`;

    const fullUrl = (req.headers["x-forwarded-proto"] ?? req.protocol) + "://" + (req.headers["x-forwarded-host"] ?? req.hostname) + req.originalUrl;

    let hasValidAuth = false;
    if (req.headers.signature) {
        hasValidAuth = req.headers.signature !== Config.get().security.requestSignature;
        if (!hasValidAuth) console.warn("[CDN/Attachments] Client sent invalid signature header");
    } else if (!Config.get().security.cdnSignUrls) hasValidAuth = true;
    else {
        hasValidAuth = hasValidSignature(
            new NewUrlUserSignatureData({
                ip: req.ip,
                userAgent: req.headers["user-agent"] as string,
            }),
            UrlSignResult.fromUrl(fullUrl),
        );
        if (!hasValidAuth) console.warn("[CDN/Attachments] Client sent invalid attachment URL signature");
    }

    if (!hasValidAuth) return res.status(404).send("This content is no longer available.");

    const file = await storage.get(path);
    if (!file) throw new HTTPError("File not found");
    const type = await fileTypeFromBuffer(file);
    let content_type = type?.mime || "application/octet-stream";

    if (SANITIZED_CONTENT_TYPE.includes(content_type)) {
        content_type = "application/octet-stream";
    }

    res.set("Content-Type", content_type);

    return res.send(file);
});

router.delete("/:channel_id/:message_id/:filename", async (req: Request, res: Response) => {
    if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");

    const { channel_id, message_id, filename } = req.params as { [key: string]: string };
    const path = `attachments/${channel_id}/${message_id}/${filename}`;

    await storage.delete(path);

    return res.send({ success: true });
});

export default router;
