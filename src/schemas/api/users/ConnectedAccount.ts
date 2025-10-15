import { ConnectedAccount } from "@spacebar/util";

export type PublicConnectedAccount = Pick<
	ConnectedAccount,
	"name" | "type" | "verified"
>;