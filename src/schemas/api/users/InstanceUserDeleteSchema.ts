import { ConnectedAccount } from "@spacebar/util";

export type InstanceUserDeleteSchema = InstanceUserDeleteSchemaContent | undefined; //unsure if this a correct way to make the body optional
export interface InstanceUserDeleteSchemaContent {
    reason?: string;
    persistInstanceBan?: boolean;
}
