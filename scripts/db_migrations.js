#!/usr/bin/node
const path = require("path");
const fs = require("fs");
const { stdout, exit } = require("process");
const { execIn } = require("./utils.js");
const { ask } = require("./utils/ask.js");

async function main() {
	let filename;
	if (process.argv[2]) filename = process.argv[2];
	else filename = await ask("Please enter the name of your migration: ");
	let dbconf;
	try {
		dbconf = JSON.parse(fs.readFileSync("dbconf.json"));
	} catch (e) {
		console.log("No dbconf.json found!");
		dbconf = {};
	}

	if (!dbconf["sqlite"])
		dbconf.sqlite = {
			conn_str: "migrations.db",
			migrations_dir: "sqlite",
			package: "sqlite3"
		};
	if (!dbconf["postgres"] && process.env.FC_DB_POSTGRES) {
		console.log("Found FC_DB_POSTGRES environment variable. Using it!");
		dbconf.postgres = {
			conn_str: process.env.FC_DB_POSTGRES,
			migrations_dir: "postgres",
			package: "pg"
		};
	}
	if (!dbconf["mariadb"] && process.env.FC_DB_MARIADB) {
		console.log("Found FC_DB_MARIADB environment variable. Using it!");
		dbconf.mariadb = {
			conn_str: process.env.FC_DB_MARIADB,
			migrations_dir: "mariadb",
			package: "mysql2"
		};
	}
	fs.writeFileSync("dbconf.json", JSON.stringify(dbconf, null, 4));

	//build
	execIn(`node scripts/build_new.js`, process.cwd(), { stdio: "inherit" });

	if (fs.existsSync(".env") && !fs.existsSync(".env.bak")) fs.renameSync(".env", ".env.bak");
	Object.keys(dbconf).forEach((db) => {
		console.log(`Applying migrations for ${db}`);
		if (!fs.existsSync(path.join("node_modules", dbconf[db].package))) execIn(`npm i ${dbconf[db].package}`, process.cwd());
		fs.writeFileSync(
			`.env`,
			`DATABASE=${dbconf[db].conn_str}
    THREADS=1
    DB_MIGRATE=true
    DB_VERBOSE=true`
		);
		execIn(`node dist/start.js`, process.cwd(), { stdio: "inherit" });
	});

	Object.keys(dbconf).forEach((db) => {
		console.log(`Generating new migrations for ${db}`);
		fs.writeFileSync(
			`.env`,
			`DATABASE=${dbconf[db].conn_str}
    THREADS=1
    DB_MIGRATE=true
    DB_VERBOSE=true`
		);
		execIn(
			`node node_modules/typeorm/cli.js migration:generate "src/util/migrations/${db}/${filename}" -d dist/util/util/Database.js -p`,
			process.cwd(),
			{ stdio: "inherit" }
		);
	});
	if (fs.existsSync(".env.bak")) {
		fs.rmSync(".env");
		fs.renameSync(".env.bak", ".env");
	}
	exit(0);
}
main();
