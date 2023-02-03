/*
	Fosscord: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Fosscord and Fosscord Contributors
	
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
discordLike -= Rights.FLAGS.MANAGE_APPLICATIONS;
discordLike -= Rights.FLAGS.MANAGE_MESSAGES;
discordLike -= Rights.FLAGS.MANAGE_RATE_LIMITS;
discordLike -= Rights.FLAGS.MANAGE_ROUTING;
discordLike -= Rights.FLAGS.MANAGE_TICKETS;
discordLike -= Rights.FLAGS.MANAGE_USERS;
discordLike -= Rights.FLAGS.MANAGE_GUILDS;
discordLike -= Rights.FLAGS.ADD_MEMBERS;
discordLike -= Rights.FLAGS.BYPASS_RATE_LIMITS;
discordLike -= Rights.FLAGS.CREDITABLE;
discordLike -= Rights.FLAGS.MANAGE_GUILD_DIRECTORY;
discordLike -= Rights.FLAGS.SEND_BACKDATED_EVENTS;
discordLike -= Rights.FLAGS.EDIT_FLAGS;
discordLike -= Rights.FLAGS.SELF_EDIT_FLAGS;
discordLike -= Rights.FLAGS.MANAGE_GROUPS;
console.log(`Discord.com-like rights:`, discordLike);
