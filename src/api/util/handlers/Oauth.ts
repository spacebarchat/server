// TODO: Puyo's connections PR would replace this file

import { Config } from "@fosscord/util";
import fetch from "node-fetch";

export interface OauthAccessToken {
	access_token: string;
	token_type: string;
	expires_in: string;
	refresh_token: string;
	scope: string;
};

export interface OauthUserDetails {
	id: string;
	email: string;
	username: string;
	avatar_url: string | null;
}

interface Connection {
	getAccessToken: (code: string) => Promise<OauthAccessToken>;
	getUserDetals: (token: string) => Promise<OauthUserDetails>;
}

const DiscordConnection: Connection = {
	getAccessToken: async (code) => {
		const { external } = Config.get();
		const { discord } = external;

		if (!discord.id || !discord.secret || !discord.redirect)
			throw new Error("Discord Oauth has not been configured.")

		const body = new URLSearchParams(
			Object.entries({
				client_id: discord.id as string,
				client_secret: discord.secret as string,
				redirect_uri: discord.redirect as string,
				code: code as string,
				grant_type: "authorization_code",
			})
		).toString();

		const resp = await fetch("https://discord.com/api/oauth2/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: body,
		});
		if (resp.status !== 200) throw new Error(`Failed to get access token.`,);

		const json = await resp.json();

		return json;
	},

	getUserDetals: async (token) => {
		const resp = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${token}`
			},
		});

		const json = await resp.json();
		if (!json.username || !json.email) throw new Error("Failed to get user details via oauth");

		return {
			id: json.id,
			email: json.email,
			username: json.username,
			avatar_url: json.avatar
				? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}?size=2048`
				: null,
		};
	}
};

const OauthCallbackHandlers: { [key: string]: Connection; } = {
	discord: DiscordConnection
};

export { OauthCallbackHandlers };