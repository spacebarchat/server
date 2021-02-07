import mongoose from "mongoose";
import { Long } from "mongodb";
import { Snowflake } from "discord-server-util";

async function main() {
	const conn = await mongoose.createConnection(
		"mongodb://localhost:27017/lambert?readPreference=secondaryPreferred",
		{
			useNewUrlParser: true,
			useUnifiedTopology: false,
		}
	);
	console.log("connected");
	const result = await conn.collection("users").insertOne({ test: Long.fromString(Snowflake.generate().toString()) });
	// .project(undefined)

	console.log(result);
}

main();
