import { BitField } from "./BitField";

export class EntitlementGiftCodeFlags extends BitField {
    static FLAGS = {
        PAYMENT_SOURCE_REQUIRED: BigInt(1) << BigInt(0),
        EXISTING_SUBSCRIPTION_DISALLOWED: BigInt(1) << BigInt(1),
        NOT_SELF_REDEEMABLE: BigInt(1) << BigInt(2),
        PROMOTION: BigInt(1) << BigInt(3),
    };
}
