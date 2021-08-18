const { CDNServer } = require("../dist/Server");
const { db } = require("@fosscord/util");
const supertest = require("supertest");
const request = supertest("http://localhost:3003");
const server = new CDNServer({ port: Number(process.env.PORT) || 3003 });

beforeAll(async () => {
	await server.start();
	db.close();
	return server;
});

afterAll(() => {
	return server.stop();
});

describe("GET /ping", () => {
	test("should return pong", async () => {
		const response = await request.get("/ping");
		expect(response.text).toBe("pong");
	});
});
