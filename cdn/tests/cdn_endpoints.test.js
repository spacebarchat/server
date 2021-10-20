const dotenv = require("dotenv");
const path = require("path");
const fse = require("fs-extra");
dotenv.config();

// TODO: write unittest to check if FileStorage.ts is working
// TODO: write unitest to check if env vars are defined

if (!process.env.STORAGE_PROVIDER) process.env.STORAGE_PROVIDER = "file";
// TODO:nodejs path.join trailing slash windows compatible
if (process.env.STORAGE_PROVIDER === "file") {
	if (process.env.STORAGE_LOCATION) {
		if (!process.env.STORAGE_LOCATION.startsWith("/")) {
			process.env.STORAGE_LOCATION = path.join(
				__dirname,
				"..",
				process.env.STORAGE_LOCATION,
				"/"
			);
		}
	} else {
		process.env.STORAGE_LOCATION = path.join(__dirname, "..", "files", "/");
	}
	fse.ensureDirSync(process.env.STORAGE_LOCATION);
}
const { CDNServer } = require("../dist/Server");
const { Config } = require("@fosscord/util");
const supertest = require("supertest");
const request = supertest("http://localhost:3003");
const server = new CDNServer({ port: Number(process.env.PORT) || 3003 });

beforeAll(async () => {
	await server.start();
	return server;
});

afterAll(() => {
	return server.stop();
});

describe("/ping", () => {
	describe("GET", () => {
		describe("without signature specified", () => {
			test("route should respond with 200", async () => {
				let response = await request.get("/ping");
				expect(response.text).toBe("pong");
			});
		});
	});
});

describe("/attachments", () => {
	describe("POST", () => {
		describe("without signature specified", () => {
			test("route should respond with 400", async () => {
				const response = await request.post("/attachments/123456789");
				expect(response.statusCode).toBe(400);
			});
		});
		describe("with signature specified, without file specified", () => {
			test("route should respond with 400", async () => {
				const response = await request
					.post("/attachments/123456789")
					.set({ signature: Config.get().security.requestSignature });
				expect(response.statusCode).toBe(400);
			});
		});
		describe("with signature specified, with file specified ", () => {
			test("route should respond with Content-type: application/json, 200 and res.body.url", async () => {
				const response = await request
					.post("/attachments/123456789")
					.set({ signature: Config.get().security.requestSignature })
					.attach("file", __dirname + "/antman.jpg");
				expect(response.statusCode).toBe(200);
				expect(response.headers["content-type"]).toEqual(
					expect.stringContaining("json")
				);
				expect(response.body.url).toBeDefined();
			});
		});
	});
	describe("GET", () => {
		describe("getting uploaded image by url returned by POST /attachments", () => {
			test("route should respond with 200", async () => {
				let response = await request
					.post("/attachments/123456789")
					.set({ signature: Config.get().security.requestSignature })
					.attach("file", __dirname + "/antman.jpg");
				request
					.get(response.body.url.replace("http://localhost:3003", ""))
					.then((x) => {
						expect(x.statusCode).toBe(200);
					});
			});
		});
	});
	describe("DELETE", () => {
		describe("deleting uploaded image by url returned by POST /attachments", () => {
			test("route should respond with res.body.success", async () => {
				let response = await request
					.post("/attachments/123456789")
					.set({ signature: Config.get().security.requestSignature })
					.attach("file", __dirname + "/antman.jpg");
				request
					.delete(
						response.body.url.replace("http://localhost:3003", "")
					)
					.then((x) => {
						expect(x.body.success).toBeDefined();
					});
			});
		});
	});
});

describe("/avatars", () => {
	describe("POST", () => {
		describe("without signature specified", () => {
			test("route should respond with 400", async () => {
				const response = await request.post("/avatars/123456789");
				expect(response.statusCode).toBe(400);
			});
		});
		describe("with signature specified, without file specified", () => {
			test("route should respond with 400", async () => {
				const response = await request
					.post("/avatars/123456789")
					.set({ signature: Config.get().security.requestSignature });
				expect(response.statusCode).toBe(400);
			});
		});
		describe("with signature specified, with file specified ", () => {
			test("route should respond with Content-type: application/json, 200 and res.body.url", async () => {
				const response = await request
					.post("/avatars/123456789")
					.set({ signature: Config.get().security.requestSignature })
					.attach("file", __dirname + "/antman.jpg");
				expect(response.statusCode).toBe(200);
				expect(response.headers["content-type"]).toEqual(
					expect.stringContaining("json")
				);
				expect(response.body.url).toBeDefined();
			});
		});
	});
	describe("GET", () => {
		describe("getting uploaded image by url returned by POST /avatars", () => {
			test("route should respond with 200", async () => {
				let response = await request
					.post("/avatars/123456789")
					.set({ signature: Config.get().security.requestSignature })
					.attach("file", __dirname + "/antman.jpg");
				request
					.get(response.body.url.replace("http://localhost:3003", ""))
					.then((x) => {
						expect(x.statusCode).toBe(200);
					});
			});
		});
	});
	describe("DELETE", () => {
		describe("deleting uploaded image by url returned by POST /avatars", () => {
			test("route should respond with res.body.success", async () => {
				let response = await request
					.post("/avatars/123456789")
					.set({ signature: Config.get().security.requestSignature })
					.attach("file", __dirname + "/antman.jpg");
				request
					.delete(
						response.body.url.replace("http://localhost:3003", "")
					)
					.then((x) => {
						expect(x.body.success).toBeDefined();
					});
			});
		});
	});
});

describe("/external", () => {
	describe("POST", () => {
		describe("without signature specified", () => {
			test("route should respond with 400", async () => {
				const response = await request.post("/external");
				expect(response.statusCode).toBe(400);
			});
		});
		describe("with signature specified, without file specified", () => {
			test("route should respond with 400", async () => {
				const response = await request
					.post("/external")
					.set({ signature: Config.get().security.requestSignature });
				expect(response.statusCode).toBe(400);
			});
		});
		describe("with signature specified, with file specified ", () => {
			test("route should respond with Content-type: application/json, 200 and res.body.url", async () => {
				const response = await request
					.post("/external")
					.set({ signature: Config.get().security.requestSignature })
					.send({
						url: "https://i.ytimg.com/vi_webp/TiXzhQr5AUc/mqdefault.webp",
					});
				expect(response.statusCode).toBe(200);
				expect(response.headers["content-type"]).toEqual(
					expect.stringContaining("json")
				);
				expect(response.body.id).toBeDefined();
			});
		});
		describe("with signature specified, with falsy url specified ", () => {
			test("route should respond with 400", async () => {
				const response = await request
					.post("/external")
					.set({ signature: Config.get().security.requestSignature })
					.send({
						url: "notavalidurl.123",
					});
				expect(response.statusCode).toBe(400);
			});
		});
	});
	describe("GET", () => {
		describe("getting uploaded image by url returned by POST /avatars", () => {
			test("route should respond with 200", async () => {
				let response = await request
					.post("/external")
					.set({ signature: Config.get().security.requestSignature })
					.send({
						url: "https://i.ytimg.com/vi_webp/TiXzhQr5AUc/mqdefault.webp",
					});
				request.get(`external/${response.body.id}`).then((x) => {
					expect(x.statusCode).toBe(200);
				});
			});
		});
	});
});
