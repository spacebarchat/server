import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

mongoose.plugin(mongooseAutoPopulate);

mongoose.plugin((schema: Schema, opts: any) => {
	schema.set("toObject", {
		virtuals: true,
		versionKey: false,
		transform(doc: any, ret: any) {
			delete ret._id;
			delete ret.__v;
			const props = schema.get("removeResponse") || [];
			props.forEach((prop: string) => {
				delete ret[prop];
			});
		},
	});
});

export * from "./Activity";
export * from "./Application";
export * from "./Ban";
export * from "./Channel";
export * from "./Emoji";
export * from "./Event";
export * from "./Template";
export * from "./Guild";
export * from "./Invite";
export * from "./Interaction";
export * from "./Member";
export * from "./Message";
export * from "./Status";
export * from "./Role";
export * from "./User";
export * from "./VoiceState";
