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

export class CollectiblesMarketingResponse {
    marketings: {
        [key: string]: CollectiblesMarketingItem;
    };
}

export class CollectiblesMarketingItem {
    type: number;
    version: number;
    title: string;
    body: string;
}

export class AvatarDecorationMarketingItem extends CollectiblesMarketingItem {
    declare type: 0;
    // CDN URL to the avatar decoration
    avatar: string;
    // Asset IDs
    decorations: string[];
    dismissible_content: number; // Is this a generic property?
    ref_target_background: RefTargetBackground;
}

export class NameplateMarketingItem extends CollectiblesMarketingItem {
    declare type: 2;
    asset: string;
    popout_asset: string;
}

export class TargetBackgroundReference {
    light: string | null;
    dark: string | null;
}
export class TargetBackgroundReferenceInteraction {
    resting: TargetBackgroundReference;
    hovered: TargetBackgroundReference;
}

export class RefTargetBackground {
    style: TargetBackgroundReferenceInteraction;
    asset: TargetBackgroundReferenceInteraction;
}
