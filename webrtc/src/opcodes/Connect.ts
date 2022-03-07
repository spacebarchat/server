import { WebSocket } from "@fosscord/gateway";
import { Payload } from "./index";
import { Server } from "../Server"

/*
Sent by client:

{
    "op": 12,
    "d": {
        "audio_ssrc": 0,
        "video_ssrc": 0,
        "rtx_ssrc": 0,
        "streams": [
            {
                "type": "video",
                "rid": "100",
                "ssrc": 0,
                "active": false,
                "quality": 100,
                "rtx_ssrc": 0,
                "max_bitrate": 2500000,
                "max_framerate": 20,
                "max_resolution": {
                    "type": "fixed",
                    "width": 1280,
                    "height": 720
                }
            }
        ]
    }
}
*/

export async function onConnect(this: Server, socket: WebSocket, data: Payload) {
	socket.send(JSON.stringify({	//what is op 15?
		op: 15,
		d: { any: 100 }
	}))
}