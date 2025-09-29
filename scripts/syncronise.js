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
	"Why?" I hear you say! "Why don't you just use `typeorm schema:sync`?"!
	Because we have a lot ( like, 30? ) cyclic imports in the entities folder,
	which breaks that command entirely!

	however!
	it doesn't break the below, thus we're left with this :sob:
*/

require("module-alias/register");
require("dotenv").config({ quiet: true });
const { initDatabase } = require("..");

(async () => {
	const db = await initDatabase();
	console.log("synchronising");
	await db.synchronize();
	console.log("done");
	db.destroy();
})();
