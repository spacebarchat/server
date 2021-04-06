import { CLOSECODES, OPCODES, Payload } from "../util/Constants";
import { Send } from "../util/Send";
import WebSocket from "../util/WebSocket";

export function onLazyRequest(this: WebSocket, { d }: Payload) {
	// TODO: check data
	const { guild_id, typing, channels, activities } = d;

	Send(this, {
		op: OPCODES.Dispatch,
		s: this.sequence++,
		t: "GUILD_MEMBER_LIST_UPDATE",
		d: {
			ops: [
				{
					range: [0, 99],
					op: "SYNC",
					items: [{ group: { id: "online", count: 0 } }],
				},
			],
			online_count: 1,
			member_count: 1,
			id: "everyone",
			guild_id,
			groups: [{ id: "online", count: 1 }],
		},
	});
}
