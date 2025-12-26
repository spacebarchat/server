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

import { QuestAdIdentifiersSchema, QuestSchema } from "@spacebar/schemas";

export interface QuestPlacementResponseSchema {
    // The advertisement decision ID
    request_id: string;
    // The quest to show to the user
    quest: QuestSchema | null;
    // The advertisement identifiers for the delivered quest
    ad_identifiers: QuestAdIdentifiersSchema | null;
    // The advertisement context for the delivered quest
    ad_context: { is_campaign_ias_enabled: boolean } | null;
    response_ttl_seconds: number;
    // Base64-encoded protobuf metadata for the advertisement
    metadata_raw: string | null;
}
