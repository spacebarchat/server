const typeorm = require("typeorm");
const Models = require("../dist/entities");
const { PrimaryColumn } = require("typeorm");

function shouldIncludeEntity(name) {
	return ![Models.BaseClassWithoutId, PrimaryColumn, Models.BaseClass, Models.PrimaryGeneratedColumn]
		.map((x) => x?.name)
		.includes(name);
}

async function main() {
	console.log("starting");
	const db = new typeorm.DataSource({
		type: "sqlite",
		database: ":memory:",
		entities: Object.values(Models).filter((x) => x.constructor.name == "Function" && shouldIncludeEntity(x.name)),
		synchronize: true,
	});
	await db.initialize();
	console.log("Initialized database");

	for (var i = 0; i < 100; i++) {
		await Models.User.register({ username: "User" + i });
		console.log("registered user " + i);
	}
}

main();
