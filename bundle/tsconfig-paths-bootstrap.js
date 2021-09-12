const tsConfigPaths = require("tsconfig-paths");
const path = require("path");

const cleanup = tsConfigPaths.register({
	baseUrl: path.join(__dirname, "node_modules", "@fosscord"),
	paths: {
		"@fosscord/api": ["api/dist/index.js"],
		"@fosscord/api/*": ["api/dist/*"],
		"@fosscord/gateway": ["gateway/dist/index.js"],
		"@fosscord/gateway/*": ["gateway/dist/*"],
		"@fosscord/cdn": ["cdn/dist/index.js"],
		"@fosscord/cdn/*": ["cdn/dist/*"],
	},
});
