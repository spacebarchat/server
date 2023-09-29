import { APActivity } from "activitypub-types";
import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";
import { BaseClassWithoutId } from "./BaseClass";

@Entity("federation_cache")
export class FederationCache extends BaseClassWithoutId {
	@PrimaryColumn()
	id: string;

	@Column({ type: "simple-json" })
	data: APActivity;

	@CreateDateColumn()
	created_at: Date;

	toJSON(): APActivity {
		return {
			id: this.id,
			...this.data,
		};
	}
}
