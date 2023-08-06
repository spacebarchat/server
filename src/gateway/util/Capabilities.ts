import { BitField, BitFieldResolvable, BitFlag } from "@spacebar/util";

export type CapabilityResolvable = BitFieldResolvable | CapabilityString;
type CapabilityString = keyof typeof Capabilities.FLAGS;

export class Capabilities extends BitField {
	static FLAGS = {
		// Thanks, Opencord!
		// https://github.com/MateriiApps/OpenCord/blob/master/app/src/main/java/com/xinto/opencord/gateway/io/Capabilities.kt
		LAZY_USER_NOTES: BitFlag(0),
		NO_AFFINE_USER_IDS: BitFlag(1),
		VERSIONED_READ_STATES: BitFlag(2),
		VERSIONED_USER_GUILD_SETTINGS: BitFlag(3),
		DEDUPLICATE_USER_OBJECTS: BitFlag(4),
		PRIORITIZED_READY_PAYLOAD: BitFlag(5),
		MULTIPLE_GUILD_EXPERIMENT_POPULATIONS: BitFlag(6),
		NON_CHANNEL_READ_STATES: BitFlag(7),
		AUTH_TOKEN_REFRESH: BitFlag(8),
		USER_SETTINGS_PROTO: BitFlag(9),
		CLIENT_STATE_V2: BitFlag(10),
		PASSIVE_GUILD_UPDATE: BitFlag(11),
	};

	any = (capability: CapabilityResolvable) => super.any(capability);
	has = (capability: CapabilityResolvable) => super.has(capability);
}
