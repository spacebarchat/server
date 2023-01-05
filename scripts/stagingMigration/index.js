const { DataSourceOptions, DatabaseType, initDatabase } = require("../..");
const path = require("path");

(async () => {
	DataSourceOptions.setOptions({
		logging: true,
		migrations: [path.join(process.cwd(), "scripts", "stagingMigration", DatabaseType, "*.js")]
	});

	const dbConnection = await DataSourceOptions.initialize();
	await dbConnection.runMigrations();
	await dbConnection.destroy();
	console.log("migration done");
})();