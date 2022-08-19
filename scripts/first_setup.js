const path = require("path");
const fs = require("fs");
const { stdout, exit } = require("process");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const data = { env: [], config: { register: {} } };
let rights = [];

console.log("Welcome to Fosscord!");
console.log("Please remember this is pre-release software!");
console.log("We will guide you through some important setup steps.");
console.log();

async function main() {
	printTitle("Step 1: Database setup");
	console.log("1. PostgreSQL (recommended)");
	console.log("2. MariaDB/MySQL");
	console.log("3. SQLite (not recommended, but good for a simple test)");

	while (!data.db) {
		let answer = await ask("Please select a database type: ");
		if (answer == "1") {
			data.db = "postgres";
		} else if (answer == "2") {
			data.db = "mariadb";
		} else if (answer == "3") {
			data.db = "sqlite";
		} else {
			console.log("Invalid choice!");
		}
	}

	printTitle("Step 2: Database credentials");
	if (data.db != "sqlite") {
		console.log("Please enter your database credentials.");
		console.log("You can leave the password field empty if you don't want to set a password.");
		console.log();
		while (!data.db_host) {
			data.db_host = await ask("Host: ");
		}
		while (!data.db_port) {
			data.db_port = await ask("Port: ");
		}
		while (!data.db_user) {
			data.db_user = await ask("Username: ");
		}
		while (!data.db_pass) {
			data.db_pass = await ask("Password: ");
		}
		while (!data.db_name) {
			data.db_name = await ask("Database name: ");
		}
	} else {
		console.log("SQLite does not use credentials...");
	}

	printTitle("Step 3: Domain setup");
	console.log("Please enter your domain.");
	console.log("You can leave the port field empty if you don't want to set a port.");
	console.log();

	data.domain = await ask("Domain (default=localhost): ");
	if (!data.domain) data.domain = "localhost";
	else data.ssl = /y?/i.test(await ask("SSL/HTTPS (Y/n): ")).toLowerCase();

	data.port = await ask("Port (default=3001): ");
	if (!data.port) data.port = "3001";

	if (data.db != "sqlite")
		data.env.push(`DATABASE=${data.db}://${data.db_user}:${data.db_pass}@${data.db_host}:${data.db_port}/${data.db_name}`);
	data.env.push(`PORT=${data.port}`);

	printTitle("Step 4: Default rights");
	console.log("Please enter the default rights for new users.");
	console.log("Valid rights are: none, discord, full, custom.");
	console.log();
	let lines = fs.readFileSync(path.join(__dirname, "..", "src", "util", "util", "Rights.ts")).toString();
	let lines2 = lines.split("\n");
	let lines3 = lines2.filter((y) => y.includes(": BitFlag("));
	let lines4 = lines3.map((x) => x.split("//")[0].trim());

	let maxRights = 0n;
	lines4.forEach((x) => {
		maxRights += eval(`rights.${x.replace(":", " = ").replace(",", ";")}`);
	});
	discordRights = maxRights;
	discordRights -= rights.SEND_BACKDATED_EVENTS;
	discordRights -= rights.MANAGE_GUILD_DIRECTORY;
	discordRights -= rights.CREDITABLE;
	discordRights -= rights.BYPASS_RATE_LIMITS;
	discordRights -= rights.ADD_MEMBERS;
	discordRights -= rights.MANAGE_RATE_LIMITS;
	discordRights -= rights.OPERATOR;

	data.default_rights = await ask("Rights (default=none): ");
	if (!data.default_rights || data.defaultRights == "none") data.config.register.defaultRights = "0";
	else if (data.default_rights == "discord") data.config.register.defaultRights = discordRights.toString();
	else if (data.default_rights == "full") data.config.register.defaultRights = maxRights.toString();
	else if (data.default_rights == "custom") data.config.register.defaultRights = (await askRights()).toString();

	if (data.domain != "localhost")
		data.config = {
			cdn: {
				endpointPrivate: `http://localhost:${data.port}`,
				endpointPublic: `${data.ssl ? "https" : "http"}://${data.domain}:${data.port}`
			},
			gateway: {
				endpointPrivate: `ws://localhost:${data.port}`,
				endpointPublic: `${data.ssl ? "wss" : "ws"}://${data.domain}:${data.port}`
			},
			...data.config
		};
	//save
	fs.writeFileSync(".env", data.env.join("\n"));
	fs.writeFileSync("initial.json", JSON.stringify(data.config, (space = 4)));
	exit(0);
}
main();

async function askRights() {
	let w = 0;
	let brights = { ...eval(`rights`) };
	Object.keys(rights).forEach((x) => {
		brights[x] = false;
		let str = `[x] ${Object.keys(rights).length}: ${x}`;
		if (str.length > w) w = str.length;
	});

	let resp = "";
	let selectedRights = 0n;
	while (resp != "q") {
		selectedRights = 0n;
		Object.keys(brights).forEach((x) => {
			if (brights[x]) selectedRights += rights[x];
		});
		console.clear();
		printTitle("Step 4: Default rights");
		printTitle(`Current rights: ${selectedRights} (0b${selectedRights.toString(2)}, 0x${selectedRights.toString(16)})`);
		let xpos = 0;
		Object.keys(rights).forEach((x) => {
			let str = `[${brights[x] ? "X" : " "}] ${Object.keys(rights).indexOf(x)}: ${x}`.padEnd(w + 1, " ");
			if (xpos + str.length > stdout.columns) {
				console.log();
				xpos = 0;
			}
			stdout.write(str);
			xpos += str.length;
		});

		console.log();
		resp = await ask("Enter an option, or q to exit: ");
		if (/\d{1,}/.test(resp) && resp < Object.keys(rights).length && resp > -1) {
			brights[Object.keys(brights)[parseInt(resp)]] ^= true;
		}
	}
	return selectedRights;
}

async function askRight(right) {
	let answer = await ask(`${right}: `);
	if (answer == "y") return true;
	else if (answer == "n") return false;
	else return askRight(right);
}

function printTitle(input) {
	let width = stdout.columns / 2 - 1; //40
	console.log();
	console.log("-".repeat(width - input.length / 2), input, "-".repeat(width - input.length / 2));
	console.log();
}
async function ask(question) {
	return new Promise((resolve, reject) => {
		return rl.question(question, (answer) => {
			resolve(answer);
		});
	}).catch((err) => {
		console.log(err);
	});
}

function BitFlag(int) {
	return 1n << BigInt(int);
}
