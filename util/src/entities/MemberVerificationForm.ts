import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn, RelationId } from "typeorm";
import { Guild } from "./Guild";
import { BaseClassWithoutId } from "./BaseClass";

export interface MemberVerificationFormField {
	field_type: string;
	label: string;
	required: boolean;
	values: string[];
}

@Entity("member_verification_forms")
@Index(["id"], { unique: true })
export class MemberVerificationForm extends BaseClassWithoutId {
	@PrimaryColumn()
	@RelationId((form: MemberVerificationForm) => form.guild)
	id: string;

	@JoinColumn({ name: "id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE",
	})
	guild: Guild;

	@Column({ nullable: true })
	description?: string;

	@Column({ type: "simple-json" })
	form_fields: MemberVerificationFormField[];

	@Column()
	version: Date;
}
