const path = require("path");
const fs = require("fs");
const { env } = require("process");
const { execSync } = require("child_process");
const { argv, stdout, exit } = require("process");

const { execIn, getLines, parts } = require("./utils");

let npmi_extra_flags = "";

const resolveminor = argv.includes("resolveminor");
if(argv.includes("nobuild")) npmi_extra_flags += "--ignore-scripts ";

parts.forEach((part) => {
	let partDir = path.join(__dirname, "..", "..", part);
	let distDir = path.join(partDir, "dist");
	console.log(`Checking updates for ${part} (${partDir})`);
	if(part == "bundle") {
		execIn(`npm run syncdeps`, partDir)
	}
    if(resolveminor) {
        fs.rmSync(path.join(partDir, "node_modules"), {
			recursive: true,
			force: true,
		});
        execIn(`npm i --save --no-fund --no-audit --no-package-lock ${npmi_extra_flags}`, partDir)
    }
	let x = [
		[
			"pkg",
			{
				current: "1.0",
				wanted: "2.0",
				latest: "2.0",
				dependent: "cdn",
				location: "/usr/src/fosscord/bundle/node_packages/pkg",
			},
		],
	];
	x = Object.entries(
		JSON.parse(execIn("npm outdated --json", partDir))
	);
	x.forEach((a) => {
        let pkgname = a[0];
        let pkginfo = a[1];
        if(!pkginfo.current)
            console.log(`MISSING ${pkgname}: ${pkginfo.current} -> ${pkginfo.wanted} (latest: ${pkginfo.latest})`);
        else if(pkginfo.latest != pkginfo.wanted){
            if(pkginfo.current != pkginfo.wanted) 
                console.log(`MINOR   ${pkgname}: ${pkginfo.current} -> ${pkginfo.wanted}`);
		    console.log(`MAJOR   ${pkgname}: ${pkginfo.current} -> ${pkginfo.latest}`);
        }
        else
            console.log(`MINOR   ${pkgname}: ${pkginfo.current} -> ${pkginfo.wanted}`);
	});
});
