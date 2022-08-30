const localStorage = window.localStorage;
// TODO: remote auth
// window.GLOBAL_ENV.REMOTE_AUTH_ENDPOINT = window.GLOBAL_ENV.GATEWAY_ENDPOINT.replace(/wss?:/, "");
localStorage.setItem("gatewayURL", window.GLOBAL_ENV.GATEWAY_ENDPOINT);
localStorage.setItem(
	"DeveloperOptionsStore",
	`{"trace":false,"canary":false,"logGatewayEvents":true,"logOverlayEvents":true,"logAnalyticsEvents":true,"sourceMapsEnabled":false,"axeEnabled":false}`
);

const supportedLocales = [
	"bg",
	"cs",
	"da",
	"de",
	"el",
	"en-GB",
	"es-ES",
	"fi",
	"fr",
	"hi",
	"hr",
	"hu",
	"it",
	"ja",
	"ko",
	"lt",
	"nl",
	"no",
	"pl",
	"pt-BR",
	"ro",
	"ru",
	"sv-SE",
	"th",
	"tr",
	"uk",
	"vi",
	"zh-CN",
	"zh-TW"
];

const settings = JSON.parse(localStorage.getItem("UserSettingsStore"));
if (settings && !supportedLocales.includes(settings.locale)) {
	// fix client locale wrong and client not loading at all
	settings.locale = "en-US";
	localStorage.setItem("UserSettingsStore", JSON.stringify(settings));
}
