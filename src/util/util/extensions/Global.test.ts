import moduleAlias from "module-alias";
moduleAlias();
import './Global';
import {  describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe("Global extensions", () => {

	it("sleep", async () => {
		const start = Date.now();
		await sleep(100);
		const duration = Date.now() - start;
		assert(duration >= 100, `Sleep duration was less than expected: ${duration}ms`);
	});

});