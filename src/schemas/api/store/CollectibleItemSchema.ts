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

import { CollectibleItemType } from "./CollectibleItemType";
import { CollectibleNameplateColorPalette } from "./CollectibleNameplateColorPalette";
import { CollectibleProfileEffectAnimationType } from "./CollectibleProfileEffectAnimationType";

export interface CollectibleItemAssetsSchema {
    /**
     * The URL for the static image of the collectible
     */
    static_image_url: string;
    /**
     * The URL for the animated image of the collectible (in APNG format)
     */
    animated_image_url: string;
    /**
     * The URL for the video of the collectible
     */
    video_url?: string;
}

export interface CollectibleProfileEffectPosition {
    /**
     * The x-coordinate of the animation frame
     */
    x: number;
    /**
     * The y-coordinate of the animation frame
     */
    y: number;
}

export interface CollectibleProfileEffectSource {
    /**
     * The URL of the animation image (in APNG format)
     */
    src: string;
}

export interface CollectibleProfileEffectAnimation {
    /**
     * The URL of the animation image (in APNG format)
     */
    src: string;
    /**
     * Whether the animation frame should loop
     */
    loop: boolean;
    /**
     * The height of the animation image
     */
    height: number;
    /**
     * The width of the animation image
     */
    width: number;
    /**
     * The duration of the animation frame (in milliseconds)
     */
    duration: number;
    /**
     * The start time of the animation frame (in milliseconds)
     */
    start: number;
    /**
     * The delay between loops of the animation frame (in milliseconds)
     */
    loopDelay: number;
    /**
     * The position of the animation frame
     */
    position: CollectibleProfileEffectPosition;
    /**
     * The z-index of the animation frame
     */
    zIndex: number;
    /**
     * The sources to randomize the src from
     */
    randomizedSources: CollectibleProfileEffectSource[];
}

export interface CollectibleAvatarDecorationSchema {
    /**
     * The type of collectible
     */
    type: CollectibleItemType;
    /**
     * The ID of the avatar decoration
     */
    id: string;
    /**
     * The SKU ID of the avatar decoration
     */
    sku_id: string;
    /**
     * The asset hash of the avatar decoration
     */
    asset: string;
    /**
     * The URLs for the static and animated images of the avatar decoration
     */
    assets: CollectibleItemAssetsSchema;
    /**
     * The avatar decoration accessibility description
     */
    label: string;
}

export interface CollectibleProfileEffectSchema {
    /**
     * The type of collectible
     */
    type: CollectibleItemType;
    /**
     * The ID of the profile effect
     */
    id: string;
    /**
     * The ID of the profile effect SKU
     */
    sku_id: string;
    /**
     * The title of the profile effect
     */
    title: string;
    /**
     * The description of the profile effect
     */
    description: string;
    /**
     * An accessible description of the profile effect
     */
    accessibilityLabel: string;
    /**
     * The type of animation used by the profile effect
     */
    animationType: CollectibleProfileEffectAnimationType;
    /**
     * The URL of the profile effect's thumbnail preview image (in APNG format)
     */
    thumbnailPreviewSrc: string;
    /**
     * A URL of the profile effect with reduced motion (in APNG format)
     */
    reducedMotionSrc: string;
    /**
     * The URL of the static frame of the profile effect (in PNG format)
     */
    staticFrameSrc: string;
    /**
     * The animation frames for the profile effect
     */
    effects: CollectibleProfileEffectAnimation[];
}

export interface CollectibleNameplateSchema {
    /**
     * The type of collectible
     */
    type: CollectibleItemType;
    /**
     * The ID of the nameplate
     */
    id: string;
    /**
     * The SKU ID of the nameplate
     */
    sku_id: string;
    /**
     * The nameplate's color palette
     */
    palette: CollectibleNameplateColorPalette;
    /**
     * The nameplate asset path
     */
    asset: string;
    /**
     * The URLs for the static and animated images of the nameplate
     */
    assets: CollectibleItemAssetsSchema;
    /**
     * The nameplate accessibility description
     */
    label: string;
}

export type AnyCollectibleItem = CollectibleAvatarDecorationSchema | CollectibleProfileEffectSchema | CollectibleNameplateSchema;
