import { Column, Entity } from "typeorm";
import { BaseClassWithoutId, PrimaryIdColumn } from "./BaseClass";

@Entity("connection_config")
export class ConnectionConfigEntity extends BaseClassWithoutId {
	@PrimaryIdColumn()
	key: string;

	@Column({ type: "simple-json", nullable: true })
	value: number | boolean | null | string | Date | undefined;
}
