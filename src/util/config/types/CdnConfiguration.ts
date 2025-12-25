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

import { EndpointConfiguration } from "./EndpointConfiguration";

export class CdnConfiguration extends EndpointConfiguration {
    resizeHeightMax: number = 1000;
    resizeWidthMax: number = 1000;
    imagorServerUrl: string | null = null;
    proxyCacheHeaderSeconds: number = 60 * 60 * 24;
    maxAttachmentSize: number = 25 * 1024 * 1024; // 25 MB

    limits: CdnLimitsConfiguration = new CdnLimitsConfiguration();
}

export class CdnLimitsConfiguration {
    icon: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    roleIcon: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    emoji: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    sticker: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    banner: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    splash: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    avatar: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    discoverySplash: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    appIcon: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    discoverSplash: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration(); // what even is this?
    teamIcon: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
    channelIcon: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration(); // is this even used?
    guildAvatar: CdnImageLimitsConfiguration = new CdnImageLimitsConfiguration();
}

export class CdnImageLimitsConfiguration {
    constructor(data?: Partial<CdnImageLimitsConfiguration>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    maxHeight: number = 8192;
    maxWidth: number = 8192;
    maxSize: number = 10 * 1024 * 1024; // 10 MB
    allowAnimated: "always" | "never" | "premium" = "always";
}
