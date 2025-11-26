import moduleAlias from "module-alias";
moduleAlias();
import "./Object";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Object extensions", () => {
	it("map", async () => {
		const obj = { a: 1, b: 2, c: 3 };
		const result = obj.map((value, key) => `${key}:${value}`);
		assert.deepEqual(result, { a: "a:1", b: "b:2", c: "c:3" });
	});
});
