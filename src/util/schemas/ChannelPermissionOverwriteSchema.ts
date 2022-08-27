import { ChannelPermissionOverwrite } from "..";

// TODO: Only permissions your bot has in the guild or channel can be allowed/denied (unless your bot has a MANAGE_ROLES overwrite in the channel)

export interface ChannelPermissionOverwriteSchema extends ChannelPermissionOverwrite {}
