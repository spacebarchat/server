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

import { Column, Entity } from "typeorm";
import { BaseClassWithoutId, PrimaryIdColumn } from "./BaseClass";

// TODO: categories:
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
// Also populate discord default categories

@Entity("categories")
export class Categories extends BaseClassWithoutId {
	// Not using snowflake

	@PrimaryIdColumn()
	id: number;

	@Column({ nullable: true })
	name: string;

	@Column({ type: "simple-json" })
	localizations: string;

	@Column({ nullable: true })
	is_primary: boolean;
}
