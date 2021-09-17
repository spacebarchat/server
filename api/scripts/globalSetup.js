const fs = require("fs");
const path = require("path");
const { FosscordServer } = require("../dist/Server");
const Server = new FosscordServer({ port: 3001 });
global.server = Server;
module.exports = async () => {
	try {
		fs.unlinkSync(path.join(__dirname, "..", "database.db"));
	} catch {}
	return await Server.start();
};

// afterAll(async () => {
// 	return await Server.stop();
// });
