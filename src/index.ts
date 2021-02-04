import WebSocket from "ws";
import DB from "./extras/Database";
import { message_dev } from "./assets/datastru";
import { v4 } from "uuid";

class Server {
	db: any;
	constructor() {
		this.db = DB;
	}

	async listen(): Promise<void> {
		await this.db.init();
		const wss = new WebSocket.Server({ port: 8080 });

		wss.on("connection", (ws) => {
			ws.on("message", async (msg: any) => {
				const message: message_dev = msg;

				if (message.req_type) {
					switch (message.req_type) {
						case "new_auth":
							const token = v4();
							await this.db.data.auth.push({ token });
							return ws.send({ new_token: token });
						case "check_auth":
							if (!message.token) {
								return ws.send({ error: "token not providen" });
							}
							return this.db.data.auth({ token: message.token }).get();
					}
				} else {
					ws.send({ error: "req_type not providen" });
				}
			});

			ws.send("connected");
		});
	}
}

const s = new Server();
s.listen();
