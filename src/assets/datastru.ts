//* https://discord.com/developers/docs/topics/gateway

import { OPCODES, SEQUENCENUM } from "./codes";

export interface message_prod {
	op: OPCODES;
	d: object;
	s: SEQUENCENUM;
	t: string;
}

export interface message_dev {
	req_type: "new_auth" | "check_auth";
	token?: string;
}
