import { Guild } from "../../entities";

export type GuildResponse = Guild & { joined_at: string };
