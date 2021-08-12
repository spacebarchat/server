import mongoose, { Schema, Types } from "mongoose";
require("mongoose-long")(mongoose);

const userSchema = new Schema({
	id: String,
});

const messageSchema = new Schema({
	id: String,
	content: String,
});
const message = mongoose.model("message", messageSchema, "messages");
const user = mongoose.model("user", userSchema, "users");

messageSchema.virtual("u", {
	ref: user,
	localField: "id",
	foreignField: "id",
	justOne: true,
});

messageSchema.set("toObject", { virtuals: true });
messageSchema.set("toJSON", { virtuals: true });

async function main() {
	const conn = await mongoose.connect("mongodb://localhost:27017/lambert?readPreference=secondaryPreferred", {
		useNewUrlParser: true,
		useUnifiedTopology: false,
	});
	console.log("connected");

	// const u = await new user({ name: "test" }).save();
	// await new message({ user: u._id, content: "test" }).save();

	const test = await message.findOne({}).populate("u").exec();
	// @ts-ignore
	console.log(test?.toJSON());
}

main();
// Test
