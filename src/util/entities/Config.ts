import { Column, Entity } from "typeorm";
import { BaseClassWithoutId, PrimaryIdColumn } from "./BaseClass";

@Entity("config")
export class ConfigEntity extends BaseClassWithoutId {
	@PrimaryIdColumn()
	key: string;

	@Column({ type: "simple-json", nullable: true })
	value: number | boolean | null | string | undefined;
}
