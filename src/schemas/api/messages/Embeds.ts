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

export interface Embed {
    title?: string; //title of embed
    type?: EmbedType; // type of embed (always "rich" for webhook embeds)
    description?: string; // description of embed
    url?: string; // url of embed
    timestamp?: Date; // timestamp of embed content
    color?: number; // color code of the embed
    footer?: {
        text: string;
        icon_url?: string;
        proxy_icon_url?: string;
    }; // footer object	footer information
    image?: EmbedImage; // image object	image information
    thumbnail?: EmbedImage; // thumbnail object	thumbnail information
    video?: EmbedImage; // video object	video information
    provider?: {
        name?: string;
        url?: string;
    }; // provider object	provider information
    author?: {
        name?: string;
        url?: string;
        icon_url?: string;
        proxy_icon_url?: string;
    }; // author object	author information
    fields?: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
}

export enum EmbedType {
    rich = "rich",
    image = "image",
    video = "video",
    gifv = "gifv",
    article = "article",
    link = "link",
}

export interface EmbedImage {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
}
