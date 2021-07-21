import mongoose, { Schema, Document } from "mongoose";
import mongooseAutoPopulate from "mongoose-autopopulate";

type UpdateWithAggregationPipeline = UpdateAggregationStage[];
type UpdateAggregationStage =
	| { $addFields: any }
	| { $set: any }
	| { $project: any }
	| { $unset: any }
	| { $replaceRoot: any }
	| { $replaceWith: any };
type EnforceDocument<T, TMethods> = T extends Document ? T : T & Document & TMethods;

declare module "mongoose" {
	interface Model<T, TQueryHelpers = {}, TMethods = {}> {
		// removed null -> always return document -> throw error if it doesn't exist
		findOne(
			filter?: FilterQuery<T>,
			projection?: any | null,
			options?: QueryOptions | null,
			callback?: (err: CallbackError, doc: EnforceDocument<T, TMethods>) => void
		): QueryWithHelpers<EnforceDocument<T, TMethods>, EnforceDocument<T, TMethods>, TQueryHelpers>;
		findOneAndUpdate(
			filter?: FilterQuery<T>,
			update?: UpdateQuery<T> | UpdateWithAggregationPipeline,
			options?: QueryOptions | null,
			callback?: (err: any, doc: EnforceDocument<T, TMethods> | null, res: any) => void
		): QueryWithHelpers<EnforceDocument<T, TMethods>, EnforceDocument<T, TMethods>, TQueryHelpers>;
	}
}

var HTTPError: any;

try {
	HTTPError = require("lambert-server").HTTPError;
} catch (e) {
	HTTPError = Error;
}

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
	schema.post("findOne", function (doc, next) {
		try {
			// @ts-ignore
			const isExistsQuery = JSON.stringify(this._userProvidedFields) === JSON.stringify({ _id: 1 });
			if (!doc && !isExistsQuery) return next(new HTTPError("Not found", 404));
			// @ts-ignore
			return next();
		} catch (error) {
			// @ts-ignore
			next();
		}
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
export * from "./RateLimit";
