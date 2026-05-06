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

import { MessageComponentType, UploadAttachmentRequestSchema } from "@spacebar/schemas";
import { Snowflake } from "../../Identifiers";

export interface ModalSubmitTextInputComponentData {
    type: MessageComponentType.TextInput;
    id?: number;
    custom_id: string;
    value: string;
}

export interface ModalSubmitSelectComponentData {
    type:
        | MessageComponentType.StringSelect
        | MessageComponentType.UserSelect
        | MessageComponentType.RoleSelect
        | MessageComponentType.MentionableSelect
        | MessageComponentType.ChannelSelect;
    id?: number;
    custom_id: string;
    values: string[];
}

export interface ModalSubmitFileUploadComponentData {
    type: MessageComponentType.FileUpload;
    id?: number;
    custom_id: string;
    values: Snowflake[];
}

export interface ModalSubmitRadioGroupComponentData {
    type: MessageComponentType.RadioGroup;
    id?: number;
    custom_id: string;
    value?: string | null;
}

export interface ModalSubmitCheckboxGroupComponentData {
    type: MessageComponentType.CheckboxGroup;
    id?: number;
    custom_id: string;
    values: string[];
}

export interface ModalSubmitCheckboxComponentData {
    type: MessageComponentType.Checkbox;
    id?: number;
    custom_id: string;
    value: boolean;
}

export type ModalSubmitComponentData =
    | ModalSubmitTextInputComponentData
    | ModalSubmitSelectComponentData
    | ModalSubmitFileUploadComponentData
    | ModalSubmitRadioGroupComponentData
    | ModalSubmitCheckboxGroupComponentData
    | ModalSubmitCheckboxComponentData;

export interface ModalSubmitActionRowComponentData {
    type: MessageComponentType.ActionRow;
    id?: number;
    components: ModalSubmitComponentData[];
}

export interface ModalSubmitLabelComponentData {
    type: MessageComponentType.Label;
    id?: number;
    component: ModalSubmitComponentData;
}

export interface ModalSubmitTextDisplayComponentData {
    type: MessageComponentType.TextDisplay;
    id?: number;
    content: string;
}

export type ModalSubmitTopLevelComponentData = ModalSubmitActionRowComponentData | ModalSubmitLabelComponentData | ModalSubmitTextDisplayComponentData;

export interface SendableModalSubmitDataSchema {
    id: Snowflake;
    custom_id: string;
    components: ModalSubmitTopLevelComponentData[];
    resolved?: object;
    attachments?: UploadAttachmentRequestSchema[];
}
