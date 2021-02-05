import { BitField } from "./BitField";
export declare class MessageFlags extends BitField {
    static FLAGS: {
        CROSSPOSTED: bigint;
        IS_CROSSPOST: bigint;
        SUPPRESS_EMBEDS: bigint;
        SOURCE_MESSAGE_DELETED: bigint;
        URGENT: bigint;
    };
}
