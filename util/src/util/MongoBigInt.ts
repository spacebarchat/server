import mongoose from "mongoose";

class LongSchema extends mongoose.SchemaType {
	public $conditionalHandlers = {
		$lt: this.handleSingle,
		$lte: this.handleSingle,
		$gt: this.handleSingle,
		$gte: this.handleSingle,
		$ne: this.handleSingle,
		$in: this.handleArray,
		$nin: this.handleArray,
		$mod: this.handleArray,
		$all: this.handleArray,
		$bitsAnySet: this.handleArray,
		$bitsAllSet: this.handleArray,
	};

	handleSingle(val: any) {
		return this.cast(val, null, null, "handle");
	}

	handleArray(val: any) {
		var self = this;
		return val.map(function (m: any) {
			return self.cast(m, null, null, "handle");
		});
	}

	checkRequired(val: any) {
		return null != val;
	}

	cast(val: any, scope?: any, init?: any, type?: string) {
		if (null === val) return val;
		if ("" === val) return null;
		if (typeof val === "bigint") {
			return mongoose.mongo.Long.fromString(val.toString());
		}

		if (val instanceof mongoose.mongo.Long) {
			if (type === "handle" || init == false) return val;
			return BigInt(val.toString());
		}
		if (val instanceof Number || "number" == typeof val) return BigInt(val as number);
		if (!Array.isArray(val) && val.toString) return BigInt(val.toString());

		//@ts-ignore
		throw new SchemaType.CastError("Long", val);
	}

	castForQuery($conditional: string, value: any) {
		var handler;
		if (2 === arguments.length) {
			// @ts-ignore
			handler = this.$conditionalHandlers[$conditional];
			if (!handler) {
				throw new Error("Can't use " + $conditional + " with Long.");
			}
			return handler.call(this, value);
		} else {
			return this.cast($conditional, null, null, "query");
		}
	}
}

LongSchema.cast = mongoose.SchemaType.cast;
LongSchema.set = mongoose.SchemaType.set;
LongSchema.get = mongoose.SchemaType.get;

declare module "mongoose" {
	namespace Types {
		class Long extends mongoose.mongo.Long {}
	}
	namespace Schema {
		namespace Types {
			class Long extends LongSchema {}
		}
	}
}

mongoose.Schema.Types.Long = LongSchema;
mongoose.Types.Long = mongoose.mongo.Long;
