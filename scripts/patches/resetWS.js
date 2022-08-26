const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

//copy all js and css files from assets/cache_src to assets/cache
const srcDir = path.join(__dirname, "..", "..", "assets", "cache_src");
const destDir = path.join(__dirname, "..", "..", "assets", "cache");
if(!fs.existsSync(destDir)) fs.mkdirSync(destDir);
const files = fs.readdirSync(srcDir);
files.forEach((file) => {
    const filePath = path.join(srcDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
        const ext = path.extname(file);
        if (ext === ".js" || ext === ".css") {
            const newFilePath = path.join(destDir, file);
            fs.rmSync(newFilePath);
            fs.copyFileSync(filePath, newFilePath);
            console.log(`Copied ${file} to ${newFilePath}`);
        }
    }
});