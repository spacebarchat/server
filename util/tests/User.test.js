const { initDatabase, closeDatabase } = require("../dist/util/Database");
const { User } = require("../dist/entities/User");
jest.setTimeout(10000);

beforeAll((done) => {
	initDatabase().then(() => {
		new User().validate(); // warm up schema/model
		done();
	});
});

afterAll(() => {
	closeDatabase();
});

describe("User", () => {
	test("valid discriminator: 1", async () => {
		new User({ discriminator: "1" }).validate();
	});
	test("invalid discriminator: test", async () => {
		expect(() => {
			new User({ discriminator: "test" }).validate();
		}).toThrow();
	});

	test("invalid discriminator: 0", async () => {
		expect(() => {
			new User({ discriminator: "0" }).validate();
		}).toThrow();
	});
});
