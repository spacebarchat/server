import { Tuple } from "lambert-server";

export const PayloadSchema = {
	op: Number,
	$d: new Tuple(Object, Number), // or number for heartbeat sequence
	$s: Number,
	$t: String,
};
