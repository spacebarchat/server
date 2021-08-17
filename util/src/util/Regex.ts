export const DOUBLE_WHITE_SPACE = /\s\s+/g;
export const SPECIAL_CHAR = /[@#`:\r\n\t\f\v\p{C}]/gu;
export const CHANNEL_MENTION = /<#(\d+)>/g;
export const USER_MENTION = /<@!?(\d+)>/g;
export const ROLE_MENTION = /<@&(\d+)>/g;
export const EVERYONE_MENTION = /@everyone/g;
export const HERE_MENTION = /@here/g;
