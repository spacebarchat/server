import fetch from "node-fetch";

fetch("https://discord.com/api/v8/auth/login", {
	headers: {
		authorization: "undefined",
		"content-type": "application/json",
		"x-fingerprint": "782364413927751692.ex9RorNkBsGynrJCe5Brxtc3Ytc",
		"x-super-properties":
			"eyJvcyI6Ik1hYyBPUyBYIiwiYnJvd3NlciI6IkNocm9tZSIsImRldmljZSI6IiIsImJyb3dzZXJfdXNlcl9hZ2VudCI6Ik1vemlsbGEvNS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS84Ny4wLjQyODAuNjcgU2FmYXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6Ijg3LjAuNDI4MC42NyIsIm9zX3ZlcnNpb24iOiIxMC4xNS43IiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjcyMzc2LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ==",
	},
	body: JSON.stringify({
		login: "email@gmail.com",
		password: "cleartextpassword",
		undelete: false,
		captcha_key: null,
		login_source: null,
		gift_code_sku_id: null,
	}),
	method: "POST",
});
/**
 * @returns {"token": null, "mfa": true, "sms": true, "ticket": "WzMxMTEyOTM1NzM2MjEzNTA0MSwibG9naW4iXQ.X8LHqg.vTwtZBaLu5W_XMMSvKad1OAaEoA"}
 */

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
