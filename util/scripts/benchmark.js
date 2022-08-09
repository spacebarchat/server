const typeorm = require("typeorm");
const Database = require("../dist/util/Database");
const Models = require("../dist/entities");

function shouldIncludeEntity(name) {
	return ![BaseClassWithoutId, PrimaryColumn, BaseClass, PrimaryGeneratedColumn].map((x) => x.name).includes(name);
}

async function main() {
	const db = new typeorm.DataSource({
		driver: "sqlite",
		database: ":memory:",
		entities: Object.values(Models).filter((x) => x.constructor.name == "Function" && shouldIncludeEntity(x.name)),
	});
	await db.initialize();

	for (var i = 0; i < 100; i++) {
		await Models.User.register({ username: "User" + i });
		console.log("registered user " + i);
	}
}
main();
