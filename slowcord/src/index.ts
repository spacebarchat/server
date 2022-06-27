import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { initDatabase, generateToken, User, Config } from "@fosscord/util";
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
		};
	};
}

const handlers: { [key: string]: any; } = {
	"discord": Discord,
};

app.get("/oauth/:type", async (req, res) => {
	const { type } = req.params;
	if (!type) return res.sendStatus(400);
	const handler = handlers[type];
	if (!handler) return res.sendStatus(400);

	const data = await handler.getAccessToken(req, res);
	if (!data) return res.sendStatus(500);

	const details = await handler.getUserDetails(data.access_token);
	if (!details) return res.sendStatus(500);

	// temp dirty solution
	const whitelist = [
		"226230010132824066",	// maddyunderstars
		"84022289024159744",	// arcane
		"841745750576726057",	// gold
		"398941530053672962",	// erkinalp
		"682572949219180547",	// cyber
		"920388642604732456",	// aaron
	];

	if (whitelist.indexOf(details.id) === -1) return res.sendStatus(403);

	let user = await User.findOne({ where: { email: details.email } });
	if (!user) {
		user = await User.register({
			email: details.email,
			username: details.username,
			req
		});
	}

	const token = await generateToken(user.id);

	res.cookie("oauth-discord", token, { signed: true });

	res.sendFile(path.join(__dirname, "../public/login.html"));
});

// not actually needed but whatever
app.get("/app", (req, res) => res.sendStatus(200));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/login.html"));
});

(async () => {
	await initDatabase();
	await Config.init();

	app.listen(port, () => {
		console.log(`Listening on port ${port}`);
	});
})();