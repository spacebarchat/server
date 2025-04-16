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

import type { SignalingDelegate } from "spacebar-webrtc-types";
import { green, red } from "picocolors";

export let mediaServer: SignalingDelegate;

export const WRTC_PUBLIC_IP = process.env.WRTC_PUBLIC_IP ?? "127.0.0.1";
export const WRTC_PORT_MIN = process.env.WRTC_PORT_MIN
	? parseInt(process.env.WRTC_PORT_MIN)
	: 2000;
export const WRTC_PORT_MAX = process.env.WRTC_PORT_MAX
	? parseInt(process.env.WRTC_PORT_MAX)
	: 65000;

const selectedWrtcLibrary = process.env.WRTC_LIBRARY;

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

(async () => {
	try {
		//mediaServer = require('medooze-spacebar-wrtc');
		if (!selectedWrtcLibrary)
			throw new NoConfiguredLibraryError("No library configured in .env");

		mediaServer = new // @ts-ignore
		(await import(selectedWrtcLibrary)).default();

		console.log(
			`[WebRTC] ${green(`Succesfully loaded ${selectedWrtcLibrary}`)}`,
		);
	} catch (error) {
		console.log(
			`[WebRTC] ${red(`Failed to import ${selectedWrtcLibrary}: ${error instanceof NoConfiguredLibraryError ? error.message : ""}`)}`,
		);
	}
})();
