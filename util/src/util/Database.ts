import "./MongoBigInt";
import mongoose, { Collection, Connection, LeanDocument } from "mongoose";
import { ChangeStream, ChangeEvent, Long } from "mongodb";
import EventEmitter from "events";
const uri = process.env.MONGO_URL || "mongodb://localhost:27017/fosscord?readPreference=secondaryPreferred";
import { URL } from "url";

const url = new URL(uri.replace("mongodb://", "http://"));

const connection = mongoose.createConnection(uri, {
	autoIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});
console.log(`[Database] connect: mongodb://${url.username}@${url.host}${url.pathname}${url.search}`);
connection.once("open", () => {
	console.log("[Database] connected");
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
	public initalizing?: Promise<void>;

	constructor(
		public collection: Collection,
		public pipeline: Array<Record<string, unknown>>,
		public opts: {
			onlyEvents: boolean;
			array?: boolean;
		}
	) {
		super();
		if (this.opts.array == null) this.opts.array = true;
	}

	init = () => {
		if (this.initalizing) return this.initalizing;
		this.initalizing = new Promise(async (resolve, reject) => {
			// @ts-ignore
			this.stream = this.collection.watch(this.pipeline, { fullDocument: "updateLookup" });

			this.stream.on("change", this.change);
			this.stream.on("close", this.destroy);
			this.stream.on("error", console.error);

			if (!this.opts.onlyEvents) {
				const arr = await this.collection.aggregate(this.pipeline).toArray();
				if (this.opts.array) this.data = arr || [];
				else this.data = arr?.[0];
			}
			resolve();
		});
		return this.initalizing;
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
			switch (doc.operationType) {
				case "dropDatabase":
					return this.destroy();
				case "drop":
					return this.destroy();
				case "delete":
					if (!this.opts.onlyEvents) {
						if (this.opts.array) {
							this.data = this.data.filter((x: any) => doc.documentKey?._id?.equals(x._id));
						} else this.data = null;
					}
					return this.emit("delete", doc.documentKey._id.toHexString());
				case "insert":
					if (!this.opts.onlyEvents) {
						if (this.opts.array) this.data.push(doc.fullDocument);
						else this.data = doc.fullDocument;
					}
					return this.emit("insert", doc.fullDocument);
				case "update":
				case "replace":
					if (!this.opts.onlyEvents) {
						if (this.opts.array) {
							const i = this.data.findIndex((x: any) => doc.fullDocument?._id?.equals(x._id));
							if (i == -1) this.data.push(doc.fullDocument);
							else this.data[i] = doc.fullDocument;
						} else this.data = doc.fullDocument;
					}

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
		this.data = null;
		this.stream?.off("change", this.change);
		this.emit("close");

		if (this.stream.isClosed()) return;

		return this.stream.close();
	};
}
