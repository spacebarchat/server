import "./MongoBigInt";
import mongoose, { Collection, Connection, LeanDocument } from "mongoose";
import { ChangeStream, ChangeEvent, Long } from "mongodb";
import EventEmitter from "events";
import { Document } from "mongoose";
const uri = process.env.MONGO_URL || "mongodb://localhost:27017/fosscord?readPreference=secondaryPreferred";

// TODO: auto throw error if findOne doesn't find anything
console.log(`[DB] connect: ${uri}`);

const connection = mongoose.createConnection(uri, {
	autoIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

export default <Connection>connection;

function transform<T>(document: T) {
	// @ts-ignore
	if (!document || !document.toObject) {
		try {
			// @ts-ignore
			delete document._id;
			// @ts-ignore
			delete document.__v;
		} catch (error) {}
		return document;
	}
	// @ts-ignore
	return document.toObject({ virtuals: true });
}

export function toObject<T>(document: T): LeanDocument<T> {
	// @ts-ignore
	return Array.isArray(document) ? document.map((x) => transform<T>(x)) : transform(document);
}

export interface MongooseCache {
	on(event: "delete", listener: (id: string) => void): this;
	on(event: "change", listener: (data: any) => void): this;
	on(event: "insert", listener: (data: any) => void): this;
	on(event: "close", listener: () => void): this;
}

export class MongooseCache extends EventEmitter {
	public stream: ChangeStream;
	public data: any;

	constructor(
		public collection: Collection,
		public pipeline: Array<Record<string, unknown>>,
		public opts: {
			onlyEvents: boolean;
		}
	) {
		super();
	}

	init = async () => {
		// @ts-ignore
		this.stream = this.collection.watch(this.pipeline, { fullDocument: "updateLookup" });

		this.stream.on("change", this.change);
		this.stream.on("close", this.destroy);
		this.stream.on("error", console.error);

		if (!this.opts.onlyEvents) {
			const arr = await this.collection.aggregate(this.pipeline).toArray();
			this.data = arr.length ? arr[0] : arr;
		}
	};

	changeStream = (pipeline: any) => {
		this.pipeline = pipeline;
		this.destroy();
		this.init();
	};

	convertResult = (obj: any) => {
		if (obj instanceof Long) return BigInt(obj.toString());
		if (typeof obj === "object") {
			Object.keys(obj).forEach((key) => {
				obj[key] = this.convertResult(obj[key]);
			});
		}

		return obj;
	};

	change = (doc: ChangeEvent) => {
		try {
			// @ts-ignore
			if (doc.fullDocument) {
				// @ts-ignore
				if (!this.opts.onlyEvents) this.data = doc.fullDocument;
			}

			switch (doc.operationType) {
				case "dropDatabase":
					return this.destroy();
				case "drop":
					return this.destroy();
				case "delete":
					return this.emit("delete", doc.documentKey._id.toHexString());
				case "insert":
					return this.emit("insert", doc.fullDocument);
				case "update":
				case "replace":
					return this.emit("change", doc.fullDocument);
				case "invalidate":
					return this.destroy();
				default:
					return;
			}
		} catch (error) {
			this.emit("error", error);
		}
	};

	destroy = () => {
		this.stream?.off("change", this.change);
		this.emit("close");

		if (this.stream.isClosed()) return;

		return this.stream.close();
	};
}
