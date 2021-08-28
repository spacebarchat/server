const { initDatabase, closeDatabase } = require("../dist/util/Database");
const { User } = require("../dist/entities/User");
jest.setTimeout(20000);

beforeAll((done) => {
	initDatabase().then(() => {
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

	test("add guild", async () => {
		try {
			await new User({ guilds: [], discriminator: "1" }, { id: "0" }).save();
			const user = await User.find("0");

			user.guilds.push(new Guild({ name: "test" }));

			user.save();
		} catch (error) {
			console.error(error);
		}
	});
});
