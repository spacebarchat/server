const fs = require("fs");
const { FosscordServer } = require("../dist/Server");
const Server = new FosscordServer({ port: 3001 });
(async () => {
	try {
		fs.unlinkSync(`${__dirname}/database.db`);
	} catch {}
	return await Server.start();
})();

// afterAll(async () => {
// 	return await Server.stop();
// });
