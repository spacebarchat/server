import moduleAlias from "module-alias";
moduleAlias();
import './Math';
import {  describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe("Math extensions", () => {

	it("clamp", async () => {
		assert.strictEqual(Math.clamp(5, 1, 10), 5);
		assert.strictEqual(Math.clamp(0, 1, 10), 1);
		assert.strictEqual(Math.clamp(15, 1, 10), 10);
		assert.strictEqual(Math.clamp(-5, -10, -1), -5);
		assert.strictEqual(Math.clamp(-15, -10, -1), -10);
		assert.strictEqual(Math.clamp(-0.5, -1, 0), -0.5);
		assert.strictEqual(Math.clamp(1.5, 1, 2), 1.5);
	});

});