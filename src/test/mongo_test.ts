import mongoose, { Schema, Types } from "mongoose";
import { Long as MongoTypeLong } from "mongodb";
require("mongoose-long")(mongoose);

const partSchema = new Schema({
	long: {
		type: mongoose.Types.Long,
	},
});

const Part = mongoose.model("Part", partSchema, "test");

async function main() {
	const conn = await mongoose.connect("mongodb://localhost:27017/lambert?readPreference=secondaryPreferred", {
		useNewUrlParser: true,
		useUnifiedTopology: false,
	});
	console.log("connected");

	const part = new Part({ long: 390810485244821505n });

	// await part.save();
	console.log("saved");
	const test = await Part.find({});
	console.log(test);
}

main();
