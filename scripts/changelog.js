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
	Changelogs are baked inside the discord.com web client.
	To change them, we simply need to update the changelog in a specific file of the client.
	For v134842, thats 9c4b2d313c6e1c864e89.js, but it'll be different for every version.
	To find which file the changelog is stored in your client, simply grep for the changelog text given by the client,
	and update the `CHANGELOG_SCRIPT` variable to use that instead.

	This grabs the new changelog from `fosscord-server/assets/changelog.txt`
*/

const fetch = require("node-fetch");
const fs = require("fs/promises");
const path = require("path");

const CACHE_PATH = path.join(__dirname, "..", "assets", "cache");
const CHANGELOG_PATH = path.join(__dirname, "..", "assets", "changelog.txt");
const BASE_URL = "https://discord.com";

const CHANGELOG_SCRIPT = "4ec0b5948572d31df88b.js";

(async () => {
	const res = await fetch(`${BASE_URL}/assets/${CHANGELOG_SCRIPT}`);
	const text = await res.text();

	const newChangelogText = (await fs.readFile(CHANGELOG_PATH))
		.toString()
		.replaceAll("\r", "")
		.replaceAll("\n", "\\n")
		.replaceAll("'", "\\'");

	const index = text.indexOf("t.exports='---changelog---") + 11;
	const endIndex = text.indexOf("'\n", index); // hmm

	await fs.writeFile(
		path.join(CACHE_PATH, CHANGELOG_SCRIPT),
		text.substring(0, index) + newChangelogText + text.substring(endIndex),
	);
})();
