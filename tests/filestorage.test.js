const path = require("path");
process.env.STORAGE_LOCATION = path.join(__dirname, "..", "files", "/");

const { FileStorage } = require("../dist/util/FileStorage");
const storage = new FileStorage();
const fs = require("fs");

const file = fs.readFileSync(path.join(__dirname, "antman.jpg"));

describe("FileStorage", () => {
	describe("saving a file", () => {
		test("saving a buffer", async () => {
			await storage.set("test_saving_file", file);
		});
	});
	describe("getting a file", () => {
		test("getting buffer with given name", async () => {
			const buffer2 = await storage.get("test_saving_file");
			expect(Buffer.compare(file, buffer2)).toBeTruthy();
		});
	});
	describe("deleting a file", () => {
		test("deleting buffer with given name", async () => {
			await storage.delete("test_saving_file");
		});
	});
});
