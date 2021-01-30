import mongoose from "mongoose";

async function main() {
	const mongoConnection = await mongoose.createConnection(
		"mongodb://localhost:27017/lambert?readPreference=secondaryPreferred",
		{
			useNewUrlParser: true,
			useUnifiedTopology: false,
		}
	);
	console.log("connected");
}

main();
