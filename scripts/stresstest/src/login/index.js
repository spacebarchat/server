const fetch = require("node-fetch");
const fs = require("fs");
let config = require("../../config.json");
module.exports = login;
async function login(account) {
	let body = {
		fingerprint: "805826570869932034.wR8vi8lGlFBJerErO9LG5NViJFw",
		login: account.email,
		password: account.password,
	};
	let x = await fetch(config.url + "/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	console.log(x);
	x = await x.json();
	console.log(x);
	return x;
}
