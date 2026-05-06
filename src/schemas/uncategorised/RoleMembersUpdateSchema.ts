import { Snowflake } from "../Identifiers";

export interface RoleMembersUpdateSchema {
    member_ids: Snowflake[];
}
