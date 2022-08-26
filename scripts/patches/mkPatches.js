const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const { execIn, parts, getDirs, walk, sanitizeVarName } = require("../utils");

//generate git patch for each file in assets/cache
const srcDir = path.join(__dirname, "..", "..", "assets", "cache");
const destDir = path.join(__dirname, "..", "..", "assets", "cache_src");
const patchDir = path.join(__dirname, "..", "..", "assets", "testclient_patches");
if(!fs.existsSync(patchDir)) fs.mkdirSync(patchDir);
const files = fs.readdirSync(srcDir);
files.forEach((file) => {
    const filePath = path.join(srcDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
        const ext = path.extname(file);
        if (ext === ".js" || ext === ".css") {
            const newFilePath = path.join(destDir, file);
            //check if file has been modified
            let patch; 
            try {
                let es = execSync(`diff -du --speed-large-files --horizon-lines=0 ${newFilePath} ${filePath}`, {
                    maxBuffer: 1024 * 1024 * 10,
                }).toString();
                patch="";
            } catch (e) {
                patch = e.stdout.toString().replaceAll(path.join(destDir, file), file).replaceAll(path.join(srcDir, file), file);
            }
            if (patch.length > 0) {
                //generate patch;
                fs.writeFileSync(path.join(patchDir, file + ".patch"), patch);
                console.log(`Generated patch for ${file}: ${patch.length} bytes, ${patch.split("\n").length} lines, ${patch.split("\n").filter((x) => x.startsWith("+")).length} additions, ${patch.split("\n").filter((x) => x.startsWith("-")).length} deletions`);
            }
            else {
                //console.log(`No changes for ${file}`);
            }
        }
    }
});