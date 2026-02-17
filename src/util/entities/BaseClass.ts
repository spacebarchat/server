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

import { BaseEntity, BeforeInsert, BeforeUpdate, Column, ColumnOptions, FindOptionsWhere, InsertResult, ObjectIdColumn, ObjectLiteral, PrimaryColumn } from "typeorm";
import { Snowflake } from "../util/Snowflake";
import { getDatabase } from "../util/Database";
import { OrmUtils } from "../imports/OrmUtils";
import { annotationsKey } from "../util/Decorators";

export class BaseClassWithoutId extends BaseEntity {
    private get construct() {
        return this.constructor;
    }

    // stores custom annotations we may stick on the properties
    [annotationsKey]: { [p: string]: string[] };

    // retrieves the custom annotations as its not super straight forward
    get_annotations() {
        return Object.getPrototypeOf(this)[annotationsKey];
    }

    // Loops through all the keys and compares it to annotations. If the RemoveEmpty is there it sets the value to undefined if null
    clean_data() {
        const annotations = this.get_annotations();
        for (const key in this) {
            if (
                key in this && // This object has this property, should never fail but better to be safe
                key in annotations && // If this property has an annotation
                annotations[key].indexOf("JsonRemoveEmpty") > -1 && // if one of the annotations is JsonRemoveEmpty
                (this[key] == null || // If this property is null
                    (typeof this[key] == "object" && Object.keys(this[key]).length == 0))
            ) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                this[key] = undefined; // set to undefined to remove
            }
        }
        return this;
    }

    private get metadata() {
        return getDatabase()?.getMetadata(this.construct);
    }

    assign(props: object) {
        OrmUtils.mergeDeep(this, props);
        return this;
    }

    // TODO: fix eslint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON(): any {
        return Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            this.metadata!.columns // @ts-ignore
                .map((x) => [x.propertyName, this[x.propertyName]])
                .concat(
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.metadata.relations.map((x) => [
                        x.propertyName,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        this[x.propertyName],
                    ]),
                ),
        );
    }

    static increment<T extends BaseClass>(conditions: FindOptionsWhere<T>, propertyPath: string, value: number | string) {
        const repository = this.getRepository();
        return repository.increment(conditions, propertyPath, value);
    }

    static decrement<T extends BaseClass>(conditions: FindOptionsWhere<T>, propertyPath: string, value: number | string) {
        const repository = this.getRepository();
        return repository.decrement(conditions, propertyPath, value);
    }

    public async insert(): Promise<this> {
        await getDatabase()!.getRepository(this.construct).insert(this);
        return this;
    }
}

export const PrimaryIdColumn = process.env.DATABASE?.startsWith("mongodb") ? ObjectIdColumn : PrimaryColumn;

export class BaseClass extends BaseClassWithoutId {
    @PrimaryIdColumn()
    id: string = Snowflake.generate();

    @BeforeUpdate()
    @BeforeInsert()
    _do_validate() {
        if (!this.id) this.id = Snowflake.generate();
    }
}

export const ArrayColumn = (opts: ColumnOptions) => (process.env.DATABASE?.startsWith("postgres") ? Column({ ...opts, array: true }) : Column({ ...opts, type: "simple-array" }));
