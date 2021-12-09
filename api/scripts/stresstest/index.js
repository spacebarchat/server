const register = require("./src/register");
const login = require("./src/login/index");
const config = require("./config.json");
const figlet = require("figlet");
const sendMessage = require("./src/message/send");
const fs = require("fs");
figlet("Fosscord Stress Test :)", function (err, data) {
	if (err) {
		console.log("Something went wrong...");
		console.dir(err);
		return;
	}
	console.log("\x1b[32m", data);
});
setInterval(() => {
	generate();
}, 1000 * 5);
setInterval(() => {
	getUsers();
}, 60 * 1000);
async function generate() {
	var accounts = await JSON.parse(fs.readFileSync("accounts.json"));
	console.log(accounts);
	var account = await register();
	accounts.push(account);
	fs.writeFileSync("accounts.json", JSON.stringify(accounts));
	console.log(accounts.length);
	var y = await login(account);
	sendMessage(y);
}
async function getUsers() {
	var accounts = await JSON.parse(fs.readFileSync("accounts.json"));
	accounts.forEach(async (x) => {
		var y = await login(x);
		console.log(y);
		sendMessage(y);
	});
}
