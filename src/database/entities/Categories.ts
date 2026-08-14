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

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseClassWithoutId } from "./BaseClass";
import { DiscoveryCategory } from "@spacebar/schemas";

// was this an old response format? Keeping for completeness sake
// [{
// 	"id": 16,
// 	"default": "Anime & Manga",
// 	"localizations": {
// 			"de": "Anime & Manga",
// 			"fr": "Anim\u00e9s et mangas",
// 			"ru": "\u0410\u043d\u0438\u043c\u0435 \u0438 \u043c\u0430\u043d\u0433\u0430"
// 		}
// 	},
// 	"is_primary": false/true
// }]

@Entity({
    name: "categories",
})
export class Categories extends BaseClassWithoutId {
    // Not using snowflake

    @PrimaryGeneratedColumn({ type: "int2" })
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ type: "jsonb" })
    localizations: CategoryLocalization;

    // Whether to show the category prominently (e.g. in a sidebar) instead of only secondary (e.g. in search results)
    @Column({ nullable: true })
    is_primary: boolean;

    // TODO: was this removed?
    @Column({ nullable: true })
    icon?: string;

    public toDiscoveryCategory(locale?: string): DiscoveryCategory {
        locale ??= "en-US";
        let name = this.name;
        if (locale in this.localizations) name = this.localizations[locale] ?? this.name;

        return {
            id: this.id,
            name: name,
            is_primary: this.is_primary,
        } satisfies DiscoveryCategory;
    }
}

export type CategoryLocalization = { [locale: string]: string };
