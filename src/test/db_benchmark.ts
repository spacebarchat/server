// @ts-nocheck
import { r } from "rethinkdb-ts";
import faker from "faker";
import cluster from "cluster";
import { performance } from "perf_hooks";

console.log("starting");

if (cluster.isMaster) {
	for (var i = 0; i < 1; i++) {
		cluster.fork();
	}
	console.log("all nodes started");
}

if (cluster.isWorker) {
	const inserts = [];

	for (let i = 0; i < 100; i++) {
		inserts.push({
			color: faker.commerce.color(),
			department: faker.commerce.department(),
			price: faker.commerce.price(),
			product: faker.commerce.product(),
			productAdjective: faker.commerce.productAdjective(),
			productName: faker.commerce.productName(),
			productMaterial: faker.commerce.productMaterial(),
			productDescription: faker.commerce.productDescription(),
		});
	}

	async function main(connection) {
		const start = performance.now();
		await r
			.db("test")
			.table("test")
			.nth(Math.floor(Math.random() * 300000))
			.run(connection);
		const end = performance.now();
		// console.log(end - start);

		// await main(connection);
		setTimeout(main.bind(null, connection));
	}

	(async () => {
		const threads = 30;

		for (var i = 0; i < threads; i++) {
			setTimeout(async () => {
				main(await r.connect({ port: 28015, host: "192.168.178.122" }));
			});
		}
	})();
}
