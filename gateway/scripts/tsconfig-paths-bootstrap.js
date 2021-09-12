const tsConfigPaths = require("tsconfig-paths");
const path = require("path");

const cleanup = tsConfigPaths.register({
	baseUrl: path.join(__dirname, ".."),
	paths: {
		"@fosscord/gateway": ["dist/index.js"],
		"@fosscord/gateway/*": ["dist/*"],
	},
});
