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
    id?: number;
}

export interface SectionComponent extends MessageComponent {
    type: MessageComponentType.Section;
    components: TextDispalyComponent[];
    accessory: ThumbnailComponent | ButtonComponent;
}

export interface ThumbnailComponent extends MessageComponent {
    type: MessageComponentType.Thumbnail;
    description?: string;
    media: UnfurledMediaItem;
    spoiler?: boolean;
}
export interface UnfurledMediaItem {
    id?: string;
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
    flags?: number;
    content_type?: string;
    content_scan_metadata?: unknown; //TODO deal with this lol
    placeholder_version?: number;
    placeholder?: string;
    loading_state?: number;
    attachment_id?: string;
}
export interface TextDispalyComponent extends MessageComponent {
    type: MessageComponentType.TextDispaly;
    content: string;
}
export interface MediaGalleryComponent extends MessageComponent {
    type: MessageComponentType.MediaGallery;
    items: {
        media: UnfurledMediaItem;
        description?: string;
        spoiler?: boolean;
    }[];
}

export interface FileComponent extends MessageComponent {
    type: MessageComponentType.File;
    file: UnfurledMediaItem;
    spoiler: boolean;
    name: string;
    size: number;
}
export const enum SeperatorSpacing {
    Small = 1,
    Large = 2,
}
export interface SeperatorComponent extends MessageComponent {
    type: MessageComponentType.Seperator;
    divider?: boolean;
    spacing?: SeperatorSpacing;
}

export interface ActionRowComponent extends MessageComponent {
    type: MessageComponentType.ActionRow;
    components: (ButtonComponent | StringSelectMenuComponent | SelectMenuComponent | TextInputComponent)[];
}

export interface ContainerComponent extends MessageComponent {
    type: MessageComponentType.Container;
    components: (ActionRowComponent | TextDispalyComponent | SectionComponent | MediaGalleryComponent | SeperatorComponent | FileComponent)[];
    accent_color?: number;
    spoiler?: boolean;
}

export type BaseMessageComponents = ActionRowComponent | SectionComponent | TextDispalyComponent | MediaGalleryComponent | FileComponent | SeperatorComponent | ContainerComponent;

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
    Script = 0, // self command script
    ActionRow = 1,
    Button = 2,
    StringSelect = 3,
    TextInput = 4,
    UserSelect = 5,
    RoleSelect = 6,
    MentionableSelect = 7,
    ChannelSelect = 8,
    Section = 9,
    TextDispaly = 10,
    Thumbnail = 11,
    MediaGallery = 12,
    File = 13,
    Seperator = 14,
    Container = 15,
}
