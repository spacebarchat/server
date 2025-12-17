/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/*
	Super simple script to check if the server starts at all, for use in gh actions.
	Not a proper test framework by any means.
*/

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const cfgFile = path.join(__dirname, "test_config.json");
process.env.CONFIG_PATH = cfgFile;

fs.writeFileSync(
    cfgFile,
    JSON.stringify({
        api: { endpointPublic: "http://localhost:3001/api/v9/" },
        cdn: { endpointPublic: "http://localhost:3001/", endpointPrivate: "http://localhost:3001/" },
        gateway: { endpointPublic: "ws://localhost:3001/" },
    }),
);

const server = spawn("node", [path.join(__dirname, "..", "dist", "bundle", "start.js")]);

server.stdout.on("data", (data) => {
    process.stdout.write(data);

    if (data.toString().toLowerCase().includes("listening")) {
        // we good :)
        console.log("we good");
        server.kill();
        process.exit();
    }
});

server.stderr.on("data", (err) => {
    process.stdout.write(err);
    // we bad :(
    process.kill(1);
});

server.on("close", (code) => {
    console.log("closed with code", code);
    process.exit(code);
});
