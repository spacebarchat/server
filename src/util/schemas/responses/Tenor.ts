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

export enum TenorMediaTypes {
	gif,
	mediumgif,
	tinygif,
	nanogif,
	mp4,
	loopedmp4,
	tinymp4,
	nanomp4,
	webm,
	tinywebm,
	nanowebm,
}

export type TenorMedia = {
	preview: string;
	url: string;
	dims: number[];
	size: number;
};

export type TenorGif = {
	created: number;
	hasaudio: boolean;
	id: string;
	media: { [type in keyof typeof TenorMediaTypes]: TenorMedia }[];
	tags: string[];
	title: string;
	itemurl: string;
	hascaption: boolean;
	url: string;
};

export type TenorCategory = {
	searchterm: string;
	path: string;
	image: string;
	name: string;
};

export type TenorCategoriesResults = {
	tags: TenorCategory[];
};

export type TenorTrendingResults = {
	next: string;
	results: TenorGif[];
	locale: string;
};

export type TenorSearchResults = {
	next: string;
	results: TenorGif[];
};

export interface TenorGifResponse {
	id: string;
	title: string;
	url: string;
	src: string;
	gif_src: string;
	width: number;
	height: number;
	preview: string;
}

export interface TenorTrendingResponse {
	categories: TenorCategoriesResults;
	gifs: TenorGifResponse[];
}

export type TenorGifsResponse = TenorGifResponse[];
