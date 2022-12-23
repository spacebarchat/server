import Connection from "./Connection";
import RefreshableConnection from "./RefreshableConnection";

export class ConnectionStore {
	public static connections: Map<string, Connection | RefreshableConnection> =
		new Map();
}
