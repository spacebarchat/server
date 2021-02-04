const WebSocket = require("ws");

const ws = new WebSocket("ws://127.0.0.1:8080");

ws.on("open", () => {
	ws.send(JSON.stringify({ req_type: "new_auth" }));
	// ws.send(JSON.stringify({ req_type: "check_auth", token: "" }));
	// op: 0,
	// d: {},
	// s: 42,
	// t: "GATEWAY_EVENT_NAME",
});

ws.on("message", (data) => {
	console.log(data);
});
