const supertest = require("supertest");
const request = supertest("http://localhost:3001");

describe("/ping", () => {
	describe("GET", () => {
		test("should return 200 and pong", async () => {
			let response = await request.get("/api/ping");
			expect(response.text).toBe("pong");
			expect(response.statusCode).toBe(200);
		});
	});
});
