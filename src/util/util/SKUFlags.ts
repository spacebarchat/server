import { BitField } from "./BitField";

export class SKUFlags extends BitField {
    static FLAGS = {
        PREMIUM_PURCHASE: BigInt(1) << BigInt(0),
        HAS_FREE_PREMIUM_CONTENT: BigInt(1) << BigInt(1),
        AVAILABLE: BigInt(1) << BigInt(2),
        PREMIUM_AND_DISTRIBUTION: BigInt(1) << BigInt(3),
        STICKER: BigInt(1) << BigInt(4),
        GUILD_ROLE: BigInt(1) << BigInt(5),
        AVAILABLE_FOR_SUBSCRIPTION_GIFTING: BigInt(1) << BigInt(6),
        APPLICATION_GUILD_SUBSCRIPTION: BigInt(1) << BigInt(7),
        APPLICATION_USER_SUBSCRIPTION: BigInt(1) << BigInt(8),
        CREATOR_MONETIZATION: BigInt(1) << BigInt(9),
        GUILD_PRODUCT: BigInt(1) << BigInt(10),
        AVAILABLE_FOR_APPLICATION_GIFTING: BigInt(1) << BigInt(11),
    };
}
