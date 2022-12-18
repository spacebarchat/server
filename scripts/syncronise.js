/*
	"Why?" I hear you say! "Why don't you just use `typeorm schema:sync`?"!
	Because we have a lot ( like, 30? ) cyclic imports in the entities folder,
	which breaks that command entirely!

	however!
	it doesn't break the below, thus we're left with this :sob:
*/

require("module-alias/register");
require("dotenv").config();
const { initDatabase } = require("..");

(async () => {
	const db = await initDatabase();
	console.log("synchronising");
	await db.synchronize();
	console.log("done");
})();