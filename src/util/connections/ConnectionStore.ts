import Connection from "./Connection";

export class ConnectionStore {
	public static connections: Map<string, Connection> = new Map();
}
