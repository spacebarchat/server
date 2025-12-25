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

import { CloudAttachment, Config, hasValidSignature, NewUrlUserSignatureData, Snowflake, UrlSignResult } from "@spacebar/util";
import { Request, Response, Router } from "express";
import imageSize from "image-size";
import { HTTPError } from "lambert-server";
import { fileTypeFromBuffer } from "file-type";
import { cache, multer, storage } from "../../../util";
import { CdnImageLimitsConfiguration } from "../../../../util/config/types";

const router = Router({ mergeParams: true });

const SANITIZED_CONTENT_TYPE = ["text/html", "text/mhtml", "multipart/related", "application/xhtml+xml"];

const limits = Config.get().cdn.limits;
function createImageUploadRoute(name: string, path: string, limits: CdnImageLimitsConfiguration) {
    router.post(`/${name}/:user_id`, multer.single("file"), async (req: Request, res: Response) => {});
    console.log(`Registered image upload /_spacebar/cdn/upload/${name} (-> storage/${path}/) with limits:`, JSON.stringify(limits));
}

createImageUploadRoute("icon", "icons", limits.icon);
createImageUploadRoute("role-icon", "role-icons", limits.roleIcon);
createImageUploadRoute("emoji", "emojis", limits.emoji);
createImageUploadRoute("sticker", "stickers", limits.sticker);
createImageUploadRoute("banner", "banners", limits.banner);
createImageUploadRoute("splash", "splashs", limits.splash);
createImageUploadRoute("avatar", "avatars", limits.avatar);
createImageUploadRoute("discovery-splash", "discovery-splashes", limits.discoverySplash);
createImageUploadRoute("app-icon", "app-icons", limits.appIcon);
createImageUploadRoute("discover-splash", "discover-splashes", limits.discoverSplash);
createImageUploadRoute("team-icon", "team-icons", limits.teamIcon);
createImageUploadRoute("channel-icon", "channel-icons", limits.channelIcon);
createImageUploadRoute("guild-avatar", "guild-avatars", limits.guildAvatar);

export default router;
