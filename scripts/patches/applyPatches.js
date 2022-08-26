const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

//apply patches
const patchDir = path.join(__dirname, "..", "..", "assets", "testclient_patches");
const targetDir = path.join(__dirname, "..", "..", "assets", "cache");
const files = fs.readdirSync(patchDir);
files.forEach((file) => {
    const filePath = path.join(patchDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
        const ext = path.extname(file);
        if (ext === ".patch") {
            execSync(`git apply ${filePath}`, {
                cwd: targetDir,
                maxBuffer: 1024 * 1024 * 10,
            });
            console.log(`Applied patch ${file} to ${newFilePath}`);
        }
    }
});