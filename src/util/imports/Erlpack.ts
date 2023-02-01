/*
	https://github.com/discord/erlpack/blob/master/js/index.d.ts
	MIT License
	Copyright (c) 2017 Discord
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
// @fc-license-skip

export type ErlpackType = {
	pack: (data: any) => Buffer;
	unpack: <T = any>(data: Buffer) => T;
};
