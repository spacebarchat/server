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
import { storage } from "../util/Storage";
import FileType from "file-type";
import { HTTPError } from "lambert-server";
import crypto from "crypto";
import { multer } from "../util/multer";

const ANIMATED_MIME_TYPES = ["image/apng", "image/gif", "image/gifv"];
const STATIC_MIME_TYPES = [
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/svg+xml",
	"image/svg",
];
const ALLOWED_MIME_TYPES = [...ANIMATED_MIME_TYPES, ...STATIC_MIME_TYPES];

const router = Router();

router.get("/:asset_id", async (req: Request, res: Response) => {
	let { asset_id } = req.params;
	const path = `avatar-decoration-presets/${asset_id}`;

	const file = await storage.get(path);
	if (!file) throw new HTTPError("not found", 404);
	const type = await FileType.fromBuffer(file);

	res.set("Content-Type", type?.mime);
	res.set("Cache-Control", "public, max-age=31536000");

	return res.send(file);
});


export default router;
