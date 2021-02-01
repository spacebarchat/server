import fetch from "node-fetch";

fetch("https://discord.com/api/v8/auth/mfa/totp", {
	headers: {
		authorization: "undefined",
		"content-type": "application/json",
	},
	body: JSON.stringify({
		code: "722608",
		ticket: "WzMxMTEyOTM1NzM2MjEzNTA0MSwibG9naW4iXQ.X8LHqg.vTwtZBaLu5W_XMMSvKad1OAaEoA",
		login_source: null,
		gift_code_sku_id: null,
	}),
	method: "POST",
});
/**
 * @returns {"token": "mfa.-Rg2AwyP06YdTPmIDt0sqA92T8fBVITLTcXjP7zO_Uhgkg1FA0WERGjJXJyN_dyVDeBnxIWr0w3XiXW8YxVw", "user_settings": {"locale": "en-GB", "theme": "dark"}}
 */

// token:  mfa.-Rg2AwyP06YdTPmIDt0sqA92T8fBVITLTcXjP7zO_Uhgkg1FA0WERGjJXJyN_dyVDeBnxIWr0w3XiXW8YxVw

fetch("https://discord.com/api/v8/gateway", {
	headers: {
		authorization: "token",
	},
	method: "GET",
});
/**
 * @returns {"url": "wss://gateway.discord.gg"}
 */
