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
