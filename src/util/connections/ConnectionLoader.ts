import fs from "fs";
import path from "path";
import Connection from "./Connection";
import { ConnectionConfig } from "./ConnectionConfig";
import { ConnectionStore } from "./ConnectionStore";

const root = "dist/connections";
const connectionsLoaded = false;

export class ConnectionLoader {
	public static async loadConnections() {
		if (connectionsLoaded) return;
		ConnectionConfig.init();
		const dirs = fs.readdirSync(root).filter((x) => {
			try {
				fs.readdirSync(path.join(root, x));
				return true;
			} catch (e) {
				return false;
			}
		});

		dirs.forEach(async (x) => {
			const modPath = path.resolve(path.join(root, x));
			const mod = new (require(modPath).default)() as Connection;
			ConnectionStore.connections.set(mod.id, mod);

			mod.init();
			// console.log(`[Connections] Loaded connection '${mod.id}'`);
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static getConnectionConfig(id: string, defaults?: any): any {
		let cfg = ConnectionConfig.get()[id];
		if (defaults) {
			if (cfg) cfg = Object.assign({}, defaults, cfg);
			else {
				cfg = defaults;
				this.setConnectionConfig(id, cfg);
			}
		}

		if (cfg?.enabled) console.log(`[Connections] ${id} enabled`);

		// if (!cfg)
		// 	console.log(
		// 		`[ConnectionConfig/WARN] Getting connection settings for '${id}' returned null! (Did you forget to add settings?)`,
		// 	);
		return cfg;
	}

	public static async setConnectionConfig(
		id: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		config: Partial<any>,
	): Promise<void> {
		if (!config)
			console.warn(`[Connections/WARN] ${id} tried to set config=null!`);

		await ConnectionConfig.set({
			[id]: Object.assign(
				config,
				ConnectionLoader.getConnectionConfig(id) || {},
			),
		});
	}
}
