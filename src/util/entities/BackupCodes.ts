import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";

@Entity("backup_codes")
export class BackupCode extends BaseClass {
	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	user: Relation<User>;

	@Column()
	code: string;

	@Column()
	consumed: boolean;

	@Column()
	expired: boolean;
}
