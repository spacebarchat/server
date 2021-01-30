import { r } from "rethinkdb-ts";

async function main() {
	const connection = await r.connect({ port: 28015 });

	const db = r.db("test");
	const cursor = await db
		.table("guilds")
		.get(0)
		.changes({ squash: true })
		.map(function (row) {
			return row("old_val")
				.keys()
				.setUnion(row("new_val").keys())
				.concatMap(function (key) {
					return r.branch(
						row("old_val")(key).ne(row("new_val")(key)).default(true),
						[[key, row("new_val")(key).default(null)]],
						[]
					);
				})
				.coerceTo("object");
		})
		.run(connection);

	console.log("each");
	cursor.each(function (err, row) {
		if (err) throw err;
		console.log(row);
	});
	console.log("eachend");
}

main();
