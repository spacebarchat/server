require("module-alias/register");
const { Rights } = require("..");

const allRights = new Rights(1).bitfield;
console.log(`All rights:`, allRights);

var discordLike = allRights;
discordLike -= Rights.FLAGS.OPERATOR;
discordLike -= Rights.FLAGS.MANAGE_APPLICATIONS;
discordLike -= Rights.FLAGS.MANAGE_GUILDS;
discordLike -= Rights.FLAGS.MANAGE_MESSAGES;
discordLike -= Rights.FLAGS.MANAGE_RATE_LIMITS;
discordLike -= Rights.FLAGS.MANAGE_ROUTING;
discordLike -= Rights.FLAGS.MANAGE_TICKETS;
discordLike -= Rights.FLAGS.MANAGE_USERS;
discordLike -= Rights.FLAGS.ADD_MEMBERS;
discordLike -= Rights.FLAGS.BYPASS_RATE_LIMITS;
discordLike -= Rights.FLAGS.CREDITABLE;
discordLike -= Rights.FLAGS.MANAGE_GUILD_DIRECTORY;
discordLike -= Rights.FLAGS.SEND_BACKDATED_EVENTS;
console.log(`Discord.com-like rights:`, discordLike);
