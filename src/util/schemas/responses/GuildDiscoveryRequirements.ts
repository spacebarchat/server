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

export interface GuildDiscoveryRequirementsResponse {
	uild_id: string;
	safe_environment: boolean;
	healthy: boolean;
	health_score_pending: boolean;
	size: boolean;
	nsfw_properties: unknown;
	protected: boolean;
	sufficient: boolean;
	sufficient_without_grace_period: boolean;
	valid_rules_channel: boolean;
	retention_healthy: boolean;
	engagement_healthy: boolean;
	age: boolean;
	minimum_age: number;
	health_score: {
		avg_nonnew_participators: number;
		avg_nonnew_communicators: number;
		num_intentful_joiners: number;
		perc_ret_w1_intentful: number;
	};
	minimum_size: number;
}
