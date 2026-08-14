/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

export enum ReportMenuType {
    GUILD = "guild",
    GUILD_DISCOVERY = "guild_discovery",
    GUILD_DIRECTORY_ENTRY = "guild_directory_entry",
    GUILD_SCHEDULED_EVENT = "guild_scheduled_event",
    MESSAGE = "message",
    STAGE_CHANNEL = "stage_channel",
    FIRST_DM = "first_dm",
    USER = "user",
    APPLICATION = "application",
    WIDGET = "widget",
}

export type ReportMenuTypeNameArray = ReportMenuType[];
export const ReportMenuTypeNames: Record<ReportMenuType, string> = {
    [ReportMenuType.GUILD]: "guild",
    [ReportMenuType.GUILD_DISCOVERY]: "guild_discovery",
    [ReportMenuType.GUILD_DIRECTORY_ENTRY]: "guild_directory_entry",
    [ReportMenuType.GUILD_SCHEDULED_EVENT]: "guild_scheduled_event",
    [ReportMenuType.MESSAGE]: "message",
    [ReportMenuType.STAGE_CHANNEL]: "stage_channel",
    [ReportMenuType.FIRST_DM]: "first_dm",
    [ReportMenuType.USER]: "user",
    [ReportMenuType.APPLICATION]: "application",
    [ReportMenuType.WIDGET]: "widget",
};

export enum ReportButtonType {
    SUBMIT = "submit",
    DONE = "done",
    CANCEL = "cancel",
    NEXT = "next",
}

export interface ReportingMenuResponse {
    name: string;
    version: string;
    variant: string;
    postback_url: string;
    language?: string;
    root_node_id: number;
    success_node_id: number;
    fail_node_id: number;
    nodes: Record<number, ReportNode>;
}

export interface ReportNode {
    id: number;
    report_type?: string;
    key: string;
    header: string;
    subheader?: string;
    info?: string;
    children: ReportNodeChild[];
    elements: ReportElement[];
    button?: ReportButton;
    is_multi_select_required: boolean;
    is_auto_submit: boolean;
}

export interface ReportButton {
    type: ReportButtonType;
    target: number | null;
}

export interface ReportNodeChild {
    name: string;
    target_node_id: number;
}

export interface ReportElement {
    name: string;
    type: string;
    data: object;
    should_submit_data: boolean;
    skip_if_unlocalized: boolean;
    is_localized: boolean;
}
