/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { BitField } from "./BitField";

export class ApplicationFlags extends BitField {
    static FLAGS = {
        EMBEDDED_RELEASED: BigInt(1) << BigInt(1),
        MANAGED_EMOJI: BigInt(1) << BigInt(2),
        EMBEDDED_IAP: BigInt(1) << BigInt(3),
        GROUP_DM_CREATE: BigInt(1) << BigInt(4),
        RPC_PRIVATE_BETA: BigInt(1) << BigInt(5),
        AUTO_MODERATION_RULE_CREATE_BADGE: BigInt(1) << BigInt(6),
        GAME_PROFILE_DISABLED: BigInt(1) << BigInt(7),
        PUBLIC_OAUTH2_CLIENT: BigInt(1) << BigInt(8),
        CONTEXTLESS_ACTIVITY: BigInt(1) << BigInt(9),
        SOCIAL_LAYER_INTEGRATION_LIMITED: BigInt(1) << BigInt(10),
        CLOUD_GAMING_DEMO: BigInt(1) << BigInt(11),
        GATEWAY_PRESENCE: BigInt(1) << BigInt(12),
        GATEWAY_PRESENCE_LIMITED: BigInt(1) << BigInt(13),
        GATEWAY_GUILD_MEMBERS: BigInt(1) << BigInt(14),
        GATEWAY_GUILD_MEMBERS_LIMITED: BigInt(1) << BigInt(15),
        VERIFICATION_PENDING_GUILD_LIMIT: BigInt(1) << BigInt(16),
        EMBEDDED: BigInt(1) << BigInt(17),
        GATEWAY_MESSAGE_CONTENT: BigInt(1) << BigInt(18),
        GATEWAY_MESSAGE_CONTENT_LIMITED: BigInt(1) << BigInt(19),
        EMBEDDED_FIRST_PARTY: BigInt(1) << BigInt(20),
        APPLICATION_COMMAND_MIGRATED: BigInt(1) << BigInt(21),
        APPLICATION_COMMAND_BADGE: BigInt(1) << BigInt(23),
        ACTIVE: BigInt(1) << BigInt(24),
        ACTIVE_GRACE_PERIOD: BigInt(1) << BigInt(25),
        IFRAME_MODAL: BigInt(1) << BigInt(26),
        SOCIAL_LAYER_INTEGRATION: BigInt(1) << BigInt(27),
        PROMOTED: BigInt(1) << BigInt(29),
        PARTNER: BigInt(1) << BigInt(30),
        PARENT: BigInt(1) << BigInt(33),
        DISABLE_RELATIONSHIP_ACCESS: BigInt(1) << BigInt(34),
    };
}
