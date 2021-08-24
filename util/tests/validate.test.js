const { initDatabase } = require("../dist/util/Database");
const { User } = require("../dist/entities/User");

beforeAll(async () => {
	await initDatabase();

	new User().validate(); // initalize schema validator
});

describe("Validate model class properties", () => {
	describe("validation should be faster than 20ms", () => {
		expect(() => new User().validate()).toBeFasterThan(20);
	});

	describe("User", () => {
		test("object instead of string", () => {
			expect(() => {
				new User({ username: {} }).validate();
			}).toThrow();
		});
	});

	test("should not set opts", () => {
		const user = new User({ opts: { id: 0 } });
		expect(user.opts.id).not.toBe(0);
	});
});
