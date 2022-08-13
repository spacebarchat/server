import "reflect-metadata";
import { PrimaryColumn, Column, Entity } from "typeorm";
import { BaseClassWithoutId } from "./BaseClass";

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

	@PrimaryColumn()
	id: number;

	@Column({ nullable: true })
	name: string;

	@Column({ type: "simple-json" })
	localizations: string;

	@Column({ nullable: true })
	is_primary: boolean;
}
