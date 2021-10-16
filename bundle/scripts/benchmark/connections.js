require("dotenv").config();
const cluster = require("cluster");
const WebSocket = require("ws");
const endpoint = process.env.GATEWAY || "ws://localhost:3001";
const connections = Number(process.env.CONNECTIONS) || 50;
const threads = Number(process.env.THREADS) || require("os").cpus().length || 1;
const token = process.env.TOKEN;

if (!token) {
	console.error("TOKEN env var missing");
	process.exit();
}

if (cluster.isMaster) {
	for (let i = 0; i < threads; i++) {
		cluster.fork();
	}

	cluster.on("exit", (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	for (let i = 0; i < connections; i++) {
		connect();
	}
}

function connect() {
	const client = new WebSocket(endpoint);
	client.on("message", (data) => {
		data = JSON.parse(data);

		switch (data.op) {
			case 10:
				client.interval = setInterval(() => {
					client.send(JSON.stringify({ op: 1 }));
				}, data.d.heartbeat_interval);

				client.send(
					JSON.stringify({
						op: 2,
						d: {
							token,
							properties: {},
						},
					})
				);

				break;
		}
	});
	client.once("close", (code, reason) => {
		clearInterval(client.interval);
		connect();
	});
	client.on("error", (err) => {
		// console.log(err);
	});
}
