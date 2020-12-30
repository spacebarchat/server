import { Server } from "./Server";

const server = new Server();
server
	.init()
	.then(() => {
		console.log("[Server] started on :" + server.options.port);
	})
	.catch((e) => console.error("[Server] Error starting: ", e));

//// server
//// 	.destroy()
//// 	.then(() => console.log("[Server] closed."))
//// .catch((e) => console.log("[Server] Error closing: ", e));
