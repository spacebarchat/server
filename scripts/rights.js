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
	Calculates a discord.com-like rights value.
*/

require("module-alias/register");
const { Rights } = require("..");

const allRights = new Rights(1).bitfield;
console.log(`All rights:`, allRights);

var discordLike = allRights;
discordLike -= Rights.FLAGS.OPERATOR;
discordLike -= Rights.FLAGS.UNUSED_1;
discordLike -= Rights.FLAGS.MANAGE_MESSAGES;
discordLike -= Rights.FLAGS.UNUSED_2;
discordLike -= Rights.FLAGS.UNUSED_3;
discordLike -= Rights.FLAGS.UNUSED_4;
discordLike -= Rights.FLAGS.MANAGE_USERS;
discordLike -= Rights.FLAGS.MANAGE_GUILDS;
discordLike -= Rights.FLAGS.UNUSED_5;
discordLike -= Rights.FLAGS.BYPASS_RATE_LIMITS;
discordLike -= Rights.FLAGS.UNUSED_21;
discordLike -= Rights.FLAGS.UNUSED_23;
discordLike -= Rights.FLAGS.SEND_BACKDATED_EVENTS;
discordLike -= Rights.FLAGS.UNUSED_30;
discordLike -= Rights.FLAGS.UNUSED_29;
discordLike -= Rights.FLAGS.UNUSED_31;
console.log(`Discord.com-like rights:`, discordLike);
