import "dotenv/config";
import https from "https";
import mysql from "mysql2";
import fetch from "node-fetch";

const dbConn = mysql.createConnection(process.env.DATABASE as string);
const executePromise = (sql: string, args: any[]) => new Promise((resolve, reject) => dbConn.execute(sql, args, (err, res) => { if (err) reject(err); else resolve(res); }));

const instance = {
	app: process.env.INSTANCE_WEB_APP as string,
	api: process.env.INSTANCE_API as string,
	cdn: process.env.INSTANCE_CDN as string,
	token: process.env.INSTANCE_TOKEN as string,
};

const savePerf = async (time: number, name: string, error?: string | Error) => {
	if (error && typeof error != "string") error = error.message;
	try {
		await executePromise("INSERT INTO performance (value, endpoint, timestamp, error) VALUES (?, ?, ?, ?)", [time ?? 0, name, new Date(), error ?? null]);
		// await executePromise("DELETE FROM performance WHERE DATE(timestamp) < now() - interval ? DAY", [process.env.RETENTION_DAYS]);
	}
	catch (e) {
		console.error(e);
	}
};

const saveSystemUsage = async (load: number, procUptime: number, sysUptime: number, ram: number, sessions: number) => {
	try {
		await executePromise("INSERT INTO monitor (time, cpu, procUp, sysUp, ram, sessions) VALUES (?, ?, ?, ?, ?, ?)", [new Date(), load, procUptime, sysUptime, ram, sessions]);
	}
	catch (e) {
		console.error(e);
	}
};

const makeTimedRequest = (path: string, body?: object): Promise<number> => new Promise((resolve, reject) => {
	const opts = {
		hostname: new URL(path).hostname,
		port: 443,
		path: new URL(path).pathname,
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Authorization": instance.token,
		},
		timeout: 1000,
	};

	let start: number, end: number;
	const req = https.request(opts, res => {
		if (res.statusCode! < 200 || res.statusCode! > 300) {
			return reject(`${res.statusCode} ${res.statusMessage}`);
		}

		res.on("data", (data) => {
		});

		res.on("end", () => {
			end = Date.now();
			resolve(end - start);
		});
	});

	req.on("finish", () => {
		if (body) req.write(JSON.stringify(body));
		start = Date.now();
	});

	req.on("error", (error) => {
		reject(error);
	});

	req.end();
});

const measureApi = async (name: string, path: string, body?: object) => {
	let error, time = -1;
	try {
		time = await makeTimedRequest(path, body);
	}
	catch (e) {
		error = e as Error | string;
	}

	console.log(`${name} took ${time}ms ${(error ? "with error" : "")}`, error ?? "");

	await savePerf(time, name, error);
};

interface monitorzSchema {
	load: number[];
	procUptime: number;
	sysUptime: number;
	memPercent: number;
	sessions: number;
}

const app = async () => {
	await new Promise((resolve) => dbConn.connect(resolve));
	console.log("Connected to db");
	// await client.login(instance.token);

	console.log(`Monitoring performance for instance at ${new URL(instance.api).hostname}`);

	const doMeasurements = async () => {
		await measureApi("ping", `${instance.api}/ping`);
		await measureApi("users/@me", `${instance.api}/users/@me`);
		await measureApi("login", `${instance.app}/login`);
		// await gatewayMeasure("websocketPing");

		try {
			const res = await fetch(`${instance.api}/-/monitorz`, {
				headers: {
					Authorization: process.env.INSTANCE_TOKEN as string,
				}
			});
			const json = await res.json() as monitorzSchema;
			await saveSystemUsage(json.load[1], json.procUptime, json.sysUptime, json.memPercent, json.sessions);
		}
		catch (e) {
		}

		setTimeout(doMeasurements, parseInt(process.env.MEASURE_INTERVAL as string));
	};

	doMeasurements();
};

app();