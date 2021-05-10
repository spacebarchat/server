import { CDNServer } from "./Server";

const server = new CDNServer({ db: "" });
server
	.start()
	.then(() => {
		console.log("[Server] started on :" + server.options.port);
	})
	.catch((e) => console.error("[Server] Error starting: ", e));
