const { DataSourceOptions, DatabaseType, initDatabase } = require("../..");
const path = require("path");

(async () => {
	DataSourceOptions.setOptions({
		logging: true,
		migrations: [path.join(__dirname, "scripts", "stagingMigration", DatabaseType, "*.js")]
	});

	const dbConnection = await DataSourceOptions.initialize();
	await dbConnection.runMigrations();
	console.log("migration done");
})();