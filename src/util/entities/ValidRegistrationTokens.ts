import { BaseEntity, Column, Entity, PrimaryColumn } from "typeorm";

@Entity("valid_registration_tokens")
export class ValidRegistrationToken extends BaseEntity {
	@PrimaryColumn()
	token: string;
	
	@Column()
	created_at: Date = new Date();

	@Column()
	expires_at: Date;
}