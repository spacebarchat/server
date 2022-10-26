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

const settings = JSON.parse(window.localStorage.getItem("UserSettingsStore"));
if (settings && !supportedLocales.includes(settings.locale)) {
	// fix client locale wrong and client not loading at all
	settings.locale = "en-US";
	window.localStorage.setItem("UserSettingsStore", JSON.stringify(settings));
}