/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2026 Spacebar and Spacebar Contributors

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

import { ReportButtonType } from "../api/reports/ReportMenu";

export type ReportingMenuTypesResponse = string[];

export type ReportingMenuElementData =
    | null
    | string[][]
    | {
          [key: string]: string | number | boolean | null;
      };

export interface ReportingMenuElement {
    name: string;
    type: string;
    data?: ReportingMenuElementData;
    header?: string | null;
    body?: string | null;
    exclusions?: string[];
    should_submit_data?: boolean;
    skip_if_unlocalized?: boolean;
    is_localized: boolean;
}

export interface ReportingMenuButton {
    type: ReportButtonType;
    target: number | null;
}

export interface ReportingMenuNode {
    id: number;
    key: string;
    header: string | null;
    subheader: string | null;
    info: string | null;
    button: ReportingMenuButton | null;
    elements: ReportingMenuElement[];
    report_type: string | null;
    children: [string, number][];
    is_multi_select_required?: boolean;
    is_auto_submit?: boolean;
}

export interface ReportingMenuResponse {
    name: string;
    variant: string;
    version: string;
    postback_url: string;
    root_node_id: number;
    success_node_id: number;
    fail_node_id: number;
    nodes: {
        [nodeId: string]: ReportingMenuNode;
    };
}
