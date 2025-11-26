import moduleAlias from "module-alias";
moduleAlias();
import "./Array";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Array extensions", () => {
	it("containsAll", () => {
		const arr = [1, 2, 3, 4, 5];
		assert(arr.containsAll([1, 2]));
		assert(!arr.containsAll([1, 6]));
		assert(arr.containsAll([]));
		assert([].containsAll([]));

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		assert(![].containsAll([1]));
	});

	it("partition", () => {
		const arr = [1, 2, 3, 4, 5];
		const [even, odd] = arr.partition((n) => n % 2 === 0);
		assert.deepEqual(even, [2, 4]);
		assert.deepEqual(odd, [1, 3, 5]);
	});

	it("forEachAsync", async () => {
		const arr = [1, 2, 3];
		let sum = 0;
		await arr.forEachAsync(async (n) => {
			sum += n;
		});
		assert.strictEqual(sum, 6);
	});

	it("filterAsync", async () => {
		const arr = [1, 2, 3, 4, 5];
		const even = await arr.filterAsync(async (n) => n % 2 === 0);
		assert.deepEqual(even, [2, 4]);
	});

	it("remove", () => {
		const arr = [1, 2, 3, 4, 5];
		arr.remove(3);
		assert.deepEqual(arr, [1, 2, 4, 5]);
		arr.remove(6);
		assert.deepEqual(arr, [1, 2, 4, 5]);
	});

	it("distinct", () => {
		const arr = [1, 2, 2, 3, 3, 3];
		assert.deepEqual(arr.distinct(), [1, 2, 3]);
		assert.deepEqual([].distinct(), []);
	});

	it("distinctBy", () => {
		const arr = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }];
		assert.deepEqual(
			arr.distinctBy((x) => x.id),
			[{ id: 1 }, { id: 2 }, { id: 3 }],
		);
		assert.deepEqual(
			[].distinctBy((x) => x),
			[],
		);
	});

	it("intersect", () => {
		const arr1 = [1, 2, 3, 4];
		const arr2 = [3, 4, 5, 6];
		assert.deepEqual(arr1.intersect(arr2), [3, 4]);
		assert.deepEqual(arr1.intersect([]), []);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		assert.deepEqual([].intersect(arr2), []);
	});
});
