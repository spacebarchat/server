import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import * as util from "@fosscord/util";
const { initDatabase, generateToken, User, Config, handleFile } = util;
import path from "path";
import fetch from "node-fetch";

// apparently dirname doesn't exist in modules, nice
/* https://stackoverflow.com/a/62892482 */
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());
const port = process.env.PORT;

// ip -> unix epoch that requests will be accepted again
const rateLimits: { [ip: string]: number; } = {};
const allowRequestsEveryMs = 0.5 * 1000;	// every half second

const allowedRequestsPerSecond = 50;
let requestsThisSecond = 0;
setInterval(() => {
	requestsThisSecond = 0;
}, 1000);

const toDataURL = async (url: string) => {
	const response = await fetch(url);
	const blob = await response.blob();
	const buffer = Buffer.from(await blob.text());
	return `data:${blob.type};base64,${buffer.toString("base64")}`;
};

class Discord {
	static getAccessToken = async (req: Request, res: Response) => {
		const { code } = req.query;

		const body = new URLSearchParams(Object.entries({
			client_id: process.env.DISCORD_CLIENT_ID as string,
			client_secret: process.env.DISCORD_SECRET as string,
			redirect_uri: process.env.DISCORD_REDIRECT as string,
			code: code as string,
			grant_type: "authorization_code",
		})).toString();

		const resp = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: body
		});

		const json = await resp.json() as any;
		if (json.error) return null;

		return {
			access_token: json.access_token,
			token_type: json.token_type,
			expires_in: json.expires_in,
			refresh_token: json.refresh_token,
			scope: json.scope,
		};
	};

	static getUserDetails = async (token: string) => {
		const resp = await fetch("https://discord.com/api/users/@me", {
			headers: {
				"Authorization": `Bearer ${token}`,
			}
		});

		const json = await resp.json() as any;
		if (!json.username || !json.email) return null;	// eh, deal with bad code later

		return {
			id: json.id,
			email: json.email,
			username: json.username,
			avatar_url: json.avatar ? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}?size=2048` : null,
		};
	};
}

const handlers: { [key: string]: any; } = {
	"discord": Discord,
};

app.get("/oauth/:type", async (req, res) => {
	requestsThisSecond++;
	if (requestsThisSecond > allowedRequestsPerSecond)
		return res.sendStatus(429);

	const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress as string;
	console.log(`${ip}`);
	if (!rateLimits[ip]) {
		rateLimits[ip] = Date.now() + allowRequestsEveryMs;
	}
	else if (rateLimits[ip] > Date.now()) {
		rateLimits[ip] += allowRequestsEveryMs;
		console.log(`${new Date()} : user ${ip} was timed out for ${(rateLimits[ip] - Date.now()) / 1000}s`);
		return res.sendStatus(429);
	}
	else {
		delete rateLimits[ip];
	}

	const { type } = req.params;
	const handler = handlers[type];
	if (!type || !handler) return res.sendStatus(400);

	const data = await handler.getAccessToken(req, res);
	if (!data) return res.sendStatus(500);

	const details = await handler.getUserDetails(data.access_token);
	if (!details) return res.sendStatus(500);

	let user = await User.findOne({ where: { email: details.email } });
	if (!user) {
		user = await User.register({
			email: details.email,
			username: details.username,
			req
		});

		if (details.avatar_url) {
			try {
				const avatar = await handleFile(`/avatars/${user.id}`, await toDataURL(details.avatar_url) as string);
				user.avatar = avatar;
				await user.save();
			}
			catch (e) {
				console.error(e);
			}
		}
	}

	const token = await generateToken(user.id);

	res.cookie("token", token);

	res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.use(express.static("public", { extensions: ["html"] }));

(async () => {
	await initDatabase();
	await Config.init();

	app.listen(port, () => {
		console.log(`Listening on port ${port}`);
	});
})();