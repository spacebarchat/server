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

// Discord.com sends ISO strings with +00:00 extension, not Z
// This causes issues with Python bot libs
const JSONReplacer = function (
	this: { [key: string]: unknown },
	key: string,
	value: unknown,
) {
	if (this[key] instanceof Date) {
		return (this[key] as Date).toISOString().replace("Z", "+00:00");
	}

	return value;
};

export { JSONReplacer };
