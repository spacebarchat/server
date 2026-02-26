/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { red } from "picocolors";

export function getRevInfoOrFail(): { rev: string | null; lastModified: number } {
    const rootDir = path.join(__dirname, "../../../");
    // sanity check
    if (!fs.existsSync(path.join(rootDir, "package.json"))) {
        console.log(red("Error: Cannot find package.json in root directory. Are you running from the correct location?"));
    }

    // use .rev file if it exists
    if (fs.existsSync(path.join(rootDir, ".rev"))) {
        return JSON.parse(fs.readFileSync(path.join(rootDir, ".rev"), "utf-8"));
    }

    // fall back to invoking git
    try {
        const rev = execSync(`git -C "${rootDir}" rev-parse HEAD`).toString().trim();
        const lastModified = Number(execSync(`git -C "${rootDir}" log -1 --format=%cd --date=unix`).toString().trim());
        return {
            rev,
            lastModified,
        };
    } catch (e) {
        return { rev: null, lastModified: 0 };
    }
}
