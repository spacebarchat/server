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

import { PartialEmoji } from "@spacebar/schemas";

export interface MessageComponent {
    type: MessageComponentType;
}

export interface ActionRowComponent extends MessageComponent {
    type: MessageComponentType.ActionRow;
    components: (ButtonComponent | StringSelectMenuComponent | SelectMenuComponent | TextInputComponent)[];
}

export interface ButtonComponent extends MessageComponent {
    type: MessageComponentType.Button;
    style: ButtonStyle;
    label?: string;
    emoji?: PartialEmoji;
    custom_id?: string;
    sku_id?: string;
    url?: string;
    disabled?: boolean;
}

export enum ButtonStyle {
    Primary = 1,
    Secondary = 2,
    Success = 3,
    Danger = 4,
    Link = 5,
    Premium = 6,
}

export interface SelectMenuComponent extends MessageComponent {
    type:
        | MessageComponentType.StringSelect
        | MessageComponentType.UserSelect
        | MessageComponentType.RoleSelect
        | MessageComponentType.MentionableSelect
        | MessageComponentType.ChannelSelect;
    custom_id: string;
    channel_types?: number[];
    placeholder?: string;
    default_values?: SelectMenuDefaultOption[]; // only for non-string selects
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
}

export interface SelectMenuOption {
    label: string;
    value: string;
    description?: string;
    emoji?: PartialEmoji;
    default?: boolean;
}

export interface SelectMenuDefaultOption {
    id: string;
    type: "user" | "role" | "channel";
}

export interface StringSelectMenuComponent extends SelectMenuComponent {
    type: MessageComponentType.StringSelect;
    options: SelectMenuOption[];
}

export interface TextInputComponent extends MessageComponent {
    type: MessageComponentType.TextInput;
    custom_id: string;
    style: TextInputStyle;
    label: string;
    min_length?: number;
    max_length?: number;
    required?: boolean;
    value?: string;
    placeholder?: string;
}

export enum TextInputStyle {
    Short = 1,
    Paragraph = 2,
}

export enum MessageComponentType {
    ActionRow = 1,
    Button = 2,
    StringSelect = 3,
    TextInput = 4,
    UserSelect = 5,
    RoleSelect = 6,
    MentionableSelect = 7,
    ChannelSelect = 8,
    Section = 9,
    TextDisplay = 10,
    Thumbnail = 11,
    MediaGallery = 12,
    File = 13,
    Separator = 14,
    // 15 is unknown?
    ContentInventoryEntry = 16, // activity feed entry
    Container = 17,
    Label = 18,
    FileUpload = 19,
    CheckpointCard = 20, // year in review 2026
    RadioGroup = 21,
    CheckboxGroup = 22,
    Checkbox = 23,
}
