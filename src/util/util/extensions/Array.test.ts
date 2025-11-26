import moduleAlias from "module-alias";
moduleAlias();
import "./Array";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Array extensions", () => {
	it("partition", () => {
		const arr = [1, 2, 3, 4, 5];
		const [even, odd] = arr.partition((n) => n % 2 === 0);
		assert.deepEqual(even, [2, 4]);
		assert.deepEqual(odd, [1, 3, 5]);
	});

	it("remove", () => {
		const arr = [1, 2, 3, 4, 5];
		arr.remove(3);
		assert.deepEqual(arr, [1, 2, 4, 5]);
		arr.remove(6);
		assert.deepEqual(arr, [1, 2, 4, 5]);
	});
});
