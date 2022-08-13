const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { argv, stdout, exit } = require("process");
const {  execIn, parts,getDirs,walk} = require('./utils');

if(argv.includes("help")) {
	console.log(`Fosscord build script help:
Arguments:
  clean			Cleans up previous builds
  verbose		Enable verbose logging
  logerrors		Log build errors to console
  pretty-errors		Pretty-print build errors
  silent		No output to console or files.
  propagate-err	Exit script with error code if build fails.`);
	exit(0);
}

let steps = 4, i = 0;
if (argv.includes("clean")) steps++;

const verbose = argv.includes("verbose") || argv.includes("v");
const logerr = argv.includes("logerrors");
const pretty = argv.includes("pretty-errors");
const silent = argv.includes("silent");

if(silent) console.error = console.log = function(){}

if (argv.includes("clean")) {
	console.log(`[${++i}/${steps}] Cleaning...`);
	let d = "../" + "/dist";
		if (fs.existsSync(d)) {
			fs.rmSync(d, { recursive: true });
			if (verbose) console.log(`Deleted ${d}!`);
		}
}

console.log(`[${++i}/${steps}] Compiling src files ...`);

let buildFlags = ''
if(pretty) buildFlags += '--pretty '

try {
	execSync(
		'node "' +
			path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsc.js") +
			'" -p "' +
			path.join(__dirname, "..") +
			'" ' + buildFlags,
		{
			cwd: path.join(__dirname, ".."),
			shell: true,
			env: process.env,
			encoding: "utf8"
		}
		console.error(`Build failed! Please check build.log for info!`);
		if(!silent){
			if(pretty) fs.writeFileSync("build.log.ansi",  error.stdout);
			fs.writeFileSync("build.log",  error.stdout.replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''));
		}
		throw error;
	}
	console.error(`Build failed! Please check build.log for info!`);
	if(!silent){
		if(pretty) fs.writeFileSync("build.log.ansi",  error.stdout);
		fs.writeFileSync("build.log",  error.stdout.replaceAll(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, ''));
	}
}


console.log(`[${++i}/${steps}] Copying plugin data...`);
const root = path.join("src", "plugins")
let pluginFiles = walk(root).filter(x=>!x.endsWith('.ts')).map(x=>x.replace('src/',''));
pluginFiles.forEach(x=>{
	fs.copyFileSync(path.join('src',x),path.join('dist',x))
})