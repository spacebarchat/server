import mongoose from "mongoose";

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

mongoose.plugin((schema: any) => {
	schema.options.toJSON = {
		virtuals: true,
		versionKey: false,
		transform(doc: any, ret: any) {
			delete ret._id;
			delete ret.__v;
		},
	};
});
