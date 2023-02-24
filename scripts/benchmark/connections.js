/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

require("dotenv").config();
const cluster = require("cluster");
const WebSocket = require("ws");
const endpoint =
	process.env.WS_PROTOCOL +
		"://" +
		process.env.HOSTNAME +
		":" +
		process.env.PORT || "ws://0.0.0.0:3001";
const connections = Number(process.env.CONNECTIONS) || 50;
const token = process.env.TOKEN;
var cores = 1;
try {
	cores = Number(process.env.THREADS) || os.cpus().length;
} catch {
	console.log("[Bundle] Failed to get thread count! Using 1...");
}

if (!token) {
	console.error("TOKEN env var missing");
	process.exit();
}

if (cluster.isMaster) {
	for (let i = 0; i < cores; i++) {
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
					}),
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
