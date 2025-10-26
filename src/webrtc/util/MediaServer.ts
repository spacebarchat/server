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

import type { SignalingDelegate } from "@spacebarchat/spacebar-webrtc-types";
import { green, red } from "picocolors";
import { EnvConfig } from "@spacebar/util";

export let mediaServer: SignalingDelegate;

export const WRTC_PUBLIC_IP = EnvConfig.get().webrtc.publicIp;
export const WRTC_PORT_MIN = EnvConfig.get().webrtc.portMin;
export const WRTC_PORT_MAX = EnvConfig.get().webrtc.portMax;

const selectedWrtcLibrary = EnvConfig.get().webrtc.library;

// could not find a way to hide stack trace from base Error object
class NoConfiguredLibraryError implements Error {
	name: string;
	message: string;
	stack?: string | undefined;
	cause?: unknown;

	constructor(message: string) {
		this.name = "NoConfiguredLibraryError";
		this.message = message;
	}
}

export const loadWebRtcLibrary = async () => {
	try {
		//mediaServer = require('medooze-spacebar-wrtc');
		if (!selectedWrtcLibrary) throw new NoConfiguredLibraryError("No library configured in .env");

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		mediaServer = new // @ts-ignore
		(await import(selectedWrtcLibrary)).default();

		console.log(`[WebRTC] ${green(`Succesfully loaded ${selectedWrtcLibrary}`)}`);
		return Promise.resolve();
	} catch (error) {
		console.log(`[WebRTC] ${red(`Failed to import ${selectedWrtcLibrary}: ${error instanceof NoConfiguredLibraryError ? error.message : ""}`)}`);

		return Promise.reject();
	}
};

const MAX_INT32BIT = 2 ** 32;

let count = 1;
export const generateSsrc = () => {
	count++;
	if (count >= MAX_INT32BIT) count = 1;

	return count;
};
