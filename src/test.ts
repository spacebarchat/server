import { r } from "rethinkdb-ts";

async function main() {
	await r.connectPool();

	const result = await r.db("test").tableCreate("authors").run();
	console.log(result);
}

main();
