const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

//copy all js and css files from assets/cache to assets/dist
const srcDir = path.join(__dirname, "..", "..", "assets", "cache");
const destDir = path.join(__dirname, "..", "..", "assets", "cache_src");
if(!fs.existsSync(destDir)) fs.mkdirSync(destDir);
const files = fs.readdirSync(srcDir);
files.forEach((file) => {
    const filePath = path.join(srcDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
        const ext = path.extname(file);
        if (ext === ".js" || ext === ".css") {
            const newFilePath = path.join(destDir, file);
            if(!fs.existsSync(newFilePath)) {
                fs.copyFileSync(filePath, newFilePath);
                console.log(`Copied ${file} to ${newFilePath}`);
            }
        }
    }
});
if(!fs.existsSync(path.join(srcDir, ".vscode"))) fs.mkdirSync(path.join(srcDir, ".vscode"));
fs.writeFileSync(path.join(srcDir, ".vscode", "settings.json"), JSON.stringify({
    "codemetrics.basics.DecorationModeEnabled": false,
    "codemetrics.basics.CodeLensEnabled": false,
    "editor.codeLens": false,
    //"editor.minimap.enabled": false,
    "codemetrics.basics.MetricsForArrowFunctionsToggled": false,
    "codemetrics.basics.MetricsForClassDeclarationsToggled": false,
    "codemetrics.basics.MetricsForConstructorsToggled": false,
    "codemetrics.basics.MetricsForEnumDeclarationsToggled": false,
    "codemetrics.basics.MetricsForFunctionExpressionsToggled": false,
    "codemetrics.basics.MetricsForFunctionDeclarationsToggled": false,
    "codemetrics.basics.MetricsForMethodDeclarationsToggled": false,
    "codemetrics.basics.OverviewRulerModeEnabled": false,
    "editor.fontFamily": "'JetBrainsMono Nerd Font', 'JetBrainsMono', 'Droid Sans Mono', 'monospace', monospace",
    "editor.accessibilityPageSize": 1,
    "editor.accessibilitySupport": "off",
    "editor.autoClosingDelete": "never",
    //"editor.autoIndent": "none",
    //"editor.colorDecorators": false,
    "editor.comments.ignoreEmptyLines": false,
    "editor.copyWithSyntaxHighlighting": false,
    "editor.comments.insertSpace": false,
    "editor.detectIndentation": false,
    "editor.dragAndDrop": false,
    "editor.dropIntoEditor.enabled": false,
    "editor.experimental.pasteActions.enabled": false,
    "editor.guides.highlightActiveIndentation": false,
    "color-highlight.enable": false,
    "gitlens.blame.highlight.locations": [
        "gutter"
    ],
    "todohighlight.isEnable": false,
    "todohighlight.maxFilesForSearch": 1,
    "editor.maxTokenizationLineLength": 1200,
    "editor.minimap.maxColumn": 140,
    "explorer.openEditors.visible": 0,
    "editor.fontLigatures": false,
    "files.exclude": {
        "*.mp3": true,
        "*.png": true,
        "*.svg": true,
        "*.webm": true,
        "*.webp": true,
        "*.woff2": true,
        "**/.vscode/": true
    },
    "editor.guides.bracketPairs": true
}, null, 4));
console.log(`Workspace prepared at ${srcDir}!`);