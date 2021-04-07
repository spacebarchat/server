import mongoose from "mongoose";
import { Schema } from "mongoose";

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

export * from "./Ban";
export * from "./Channel";
export * from "./Emoji";
export * from "./Guild";
export * from "./Invite";
export * from "./Member";
export * from "./Role";
export * from "./User";
export * from "./Activity";
export * from "./Application";
export * from "./Interaction";
export * from "./Message";
export * from "./Status";
export * from "./VoiceState";
export * from "./Event";
