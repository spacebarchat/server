#!/usr/bin/node
const path = require("path");
const fs = require("fs");
const { stdout, exit } = require("process");
const { execIn } = require("./utils.js");
const { ask } = require("./utils/ask.js");


const data = { env: [], config: { register: {} }, extra_pkgs: [] };
let rights = [];

process.on("SIGINT", function () {
	console.log("Caught interrupt signal");
	process.exit();
});

console.log("Welcome to Fosscord!");
console.log("Please remember this is pre-release software!");
console.log("We will guide you through some important setup steps.");
console.log();

if (fs.existsSync("package-lock.json")) fs.rmSync("package-lock.json");
if (fs.existsSync("yarn.lock")) fs.rmSync("yarn.lock");

async function main() {
	printTitle("Step 1: Database setup");
	console.log("1. PostgreSQL (recommended)");
	console.log("2. MariaDB/MySQL");
	console.log("3. SQLite (not recommended, but good for a simple test)");

	while (!data.db) {
		let answer = await ask("Please select a database type: ");
		if (answer == "1") {
			data.db = "postgres";
			data.extra_pkgs.push("pg");
		} else if (answer == "2") {
			data.db = "mariadb";
			data.extra_pkgs.push("mysql2");
		} else if (answer == "3") {
			data.db = "sqlite";
			data.extra_pkgs.push("sqlite3");
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
	else data.ssl = /y?/i.test(await ask("SSL/HTTPS (Y/n): "));

	data.port = await ask("Port (default=3001): ");
	if (!data.port) data.port = "3001";

	if (data.db != "sqlite")
		data.env.push(`DATABASE=${data.db}://${data.db_user}:${data.db_pass}@${data.db_host}:${data.db_port}/${data.db_name}`);
	data.env.push(`PORT=${data.port}`);
	data.env.push("THREADS=1");

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
	printTitle("Step 5: extra options");

	if (/y?/i.test(await ask("Use fast BCrypt implementation (requires a compiler) (Y/n): "))) data.extra_pkgs.push("bcrypt");
	if (/y?/i.test(await ask("Enable support for widgets (requires compiler, known to fail on some ARM devices.) (Y/n): ")))
		data.extra_pkgs.push("canvas");

	printTitle("Step 6: finalizing...");
	//save
	console.log("==> Writing .env...");
	fs.writeFileSync(".env", data.env.join("\n"));
	console.log("==> Writing initial.json");
	fs.writeFileSync("initial.json", JSON.stringify(data.config, (space = 4)));
	//install packages...
	console.log("==> Installing packages...");
	console.log("  ==> Ensuring yarn is up to date (v3, not v1)...");
	execIn("npx yarn set version stable", process.cwd());
	console.log("  ==> Installing base packages");
	execIn("npx --yes yarn install", process.cwd(), { stdio: "inherit" });
	if (data.extra_pkgs.length > 0) {
		console.log("  ==> Checking dependencies...");
		checkCompilers();
		if (data.extra_pkgs.includes("canvas")) checkCanvasDeps();
		if (data.extra_pkgs.includes("bcrypt")) checkBcryptDeps();

		console.log(`  ==> Installing extra packages: ${data.extra_pkgs.join(", ")}...`);
		execIn(`npx --yes yarn add -O ${data.extra_pkgs.join(" ")}`, process.cwd(), { stdio: "inherit" });
	}

	console.log("==> Building...");
	execIn("npx --yes yarn run build", process.cwd(), { stdio: "inherit" });
	printTitle("Step 6: run your instance!");
	console.log("Installation is complete!");
	console.log("You can now start your instance by running 'npm run start:bundle'!");
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



function printTitle(input) {
	let width = stdout.columns / 2 - 1; //40
	console.log();
	console.log("-".repeat(width - input.length / 2), input, "-".repeat(width - input.length / 2));
	console.log();
}


function BitFlag(int) {
	return 1n << BigInt(int);
}

function checkCanvasDeps() {
	if (
		!(
			checkDep("pixman", "/usr/include/pixman-1/pixman.h") &&
			checkDep("pixman", "/usr/lib/libpixman-1.so") &&
			checkDep("cairo", "/usr/include/cairo/cairo.h") &&
			checkDep("cairo", "/usr/lib/libcairo.so") &&
			checkDep("pango", "/usr/include/pango-1.0/pango/pangocairo.h") &&
			checkDep("pango", "/usr/lib/libpango-1.0.so") &&
			checkDep("pkgconfig", "/usr/bin/pkg-config")
		)
	) {
		console.log("Canvas requires the following dependencies to be installed: pixman, cairo, pango, pkgconfig");
		exit(1);
	}
}
function checkBcryptDeps() {
	/*if (!(checkDep("bcrypt", "/usr/include/bcrypt.h") && checkDep("bcrypt", "/usr/lib/libbcrypt.so"))) {
		console.log("Bcrypt requires the following dependencies to be installed: bcrypt");
		exit(1);
	}*/
	//TODO: check if required
}

function checkCompilers() {
	//check for gcc, grep, make, python-is-python3
	if (
		!(
			checkDep("gcc", "/usr/bin/gcc") &&
			checkDep("grep", "/usr/bin/grep") &&
			checkDep("make", "/usr/bin/make") &&
			checkDep("python3", "/usr/bin/python3")
		)
	) {
		console.log("Compiler requirements not met. Please install the following: gcc, grep, make, python3");
		exit(1);
	}

	//check if /usr/bin/python is a symlink to /usr/bin/python3
	if (!fs.lstatSync("/usr/bin/python").isSymbolicLink()) {
		console.log("/usr/bin/python is not a symlink. Please make sure it is a symlink to /usr/bin/python3");
		if (fs.existsSync("/usr/bin/python3")) {
			console.log("Hint: sudo ln -s /usr/bin/python3 /usr/bin/python");
		}
		exit(1);
	}
}

function checkDep(name, path, message) {
	if (!fs.existsSync(path)) {
		console.log(`${name} not found at ${path}! Installation of some modules may fail!`);
		console.log(message ?? `Please consult your distro's manual for installation instructions.`);
	}
	return fs.existsSync(path);
}
