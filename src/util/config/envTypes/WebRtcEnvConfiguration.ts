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

import { arrayOrderBy } from "@spacebar/util";

export class WebRtcEnvConfiguration {
	static get schema() {
		return arrayOrderBy(
			[
				{ key: "WRTC_PUBLIC_IP", type: "string", description: "Public IP of the server running the media server" },
				{ key: "WRTC_PORT_MIN", type: "number", description: "Minimum port for WebRTC media server" },
				{ key: "WRTC_PORT_MAX", type: "number", description: "Maximum port for WebRTC media server" },
				{
					key: "WRTC_LIBRARY",
					type: "string",
					description: "WebRTC library to use. One of `@spacebarchat/medooze-webrtc` (voice+video) or `@spacebarchat/mediasoup-webrtc` (voice only)",
				},
			],
			(e) => e.key,
		);
	}

	get publicIp(): string {
		return process.env.WRTC_PUBLIC_IP ?? "127.0.0.1";
	}

	get portMin(): number {
		if (process.env.WRTC_PORT_MIN !== undefined) {
			return parseInt(process.env.WRTC_PORT_MIN, 10);
		}
		return 2000;
	}

	get portMax(): number {
		if (process.env.WRTC_PORT_MAX !== undefined) {
			return parseInt(process.env.WRTC_PORT_MAX, 10);
		}
		return 65000;
	}

	get library(): string | undefined {
		return process.env.WRTC_LIBRARY;
	}
}
