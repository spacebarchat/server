import { Column, Entity } from "typeorm";
import { BaseClassWithoutId, PrimaryIdColumn } from "./BaseClass";

@Entity("plugin_config")
export class PluginConfigEntity extends BaseClassWithoutId {
	@PrimaryIdColumn()
	key: string;

	@Column({ type: "simple-json", nullable: true })
	value: number | boolean | null | string | Date | undefined;
}