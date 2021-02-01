import mongoose from "mongoose";

async function main() {
	const conn = await mongoose.createConnection(
		"mongodb://localhost:27017/lambert?readPreference=secondaryPreferred",
		{
			useNewUrlParser: true,
			useUnifiedTopology: false,
		}
	);
	console.log("connected");
	const result = await conn
		.collection("users")
		.find({ $or: [{ email: "samuel.scheit@gmail.com" }, { phone: "samuel.scheit@gmail.com" }] })
		.toArray();
	// .project(undefined)

	console.log(result);
}

main();
