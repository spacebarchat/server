const fetch = require("node-fetch");
const fs = require("fs");
var config = require("../../config.json");
module.exports = sendMessage;
async function sendMessage(account) {
	var body = {
		fingerprint: "805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw",
		content: "Test",
		tts: false,
	};
	var x = await fetch(
		config.url + "/channels/" + config["text-channel"] + "/messages",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: account.token,
			},
			body: JSON.stringify(body),
		},
	);
	console.log(x);
	x = await x.json();
	console.log(x);
	return x;
}
