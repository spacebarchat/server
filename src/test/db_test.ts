import { r } from "rethinkdb-ts";

async function main() {
	const connection = await r.connect({ port: 28015, host: "192.168.178.122" });

	r.db("test");
}

main();
