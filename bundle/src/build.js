const { exec, spawn } = require("child_process");
const { exitCode } = require("process");

let parts = "api,cdn,gateway,util,bundle".split(",");
parts.forEach(element => {
    // exec(`npm --prefix ../${element} run build`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.log(`error: ${error.message}`);
    //         return;
    //     }
    //     if (stderr) {
    //         console.log(`stderr: ${stderr}`);
    //         return;
    //     }
    //     console.log(`stdout: ${stdout}`);
    // });
    spawn("npm", ["run", "build"], {cwd: `../${element}`});
});