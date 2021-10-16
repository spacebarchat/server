require("missing-native-js-functions");
const WebSocket = require("ws");
const Constants = require("./dist/util/Constants");

// const ws = new WebSocket("ws://127.0.0.1:8080");
const ws = new WebSocket("wss://dev.fosscord.com");

ws.on("open", () => {
	// ws.send(JSON.stringify({ req_type: "new_auth" }));
	// ws.send(JSON.stringify({ req_type: "check_auth", token: "" }));
	// op: 0,
	// d: {},
	// s: 42,
	// t: "GATEWAY_EVENT_NAME",
});

function send(data) {
	ws.send(JSON.stringify(data));
}

ws.on("message", (buffer) => {
	let data = JSON.parse(buffer.toString());
	console.log(data);

	switch (data.op) {
		case 10:
			setIntervalNow(() => {
				send({ op: 1 });
			}, data.d.heartbeat_interval);

			// send({
			// 	op: 2,
			// 	d: {
			// 		token:
			// 			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjgxMTY0MjkxNzQzMjA2NjA0OCIsImlhdCI6MTYxMzU4MTE1MX0.7Qj_z2lYIgJ0rc7NfGtpW5DKGqecQfv1mLpoBUQHKDc",
			// 		intents: 0n,
			// 		properties: {},
			// 	},
			// });

			send({
				op: 6,
			});

			break;
	}
});

ws.on("close", (code, reason) => {
	console.log(code, reason, Constants.CLOSECODES[code]);
});
