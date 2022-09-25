import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";
import crypto from "crypto";

@Entity("backup_codes")
export class BackupCode extends BaseClass {
	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, { onDelete: "CASCADE" })
	user: User;

	@Column()
	code: string;

	@Column()
	consumed: boolean;

	@Column()
	expired: boolean;
}

export function generateMfaBackupCodes(user_id: string) {
	let backup_codes: BackupCode[] = [];
	for (let i = 0; i < 10; i++) {
		const code = BackupCode.create({
			user: { id: user_id },
			code: crypto.randomBytes(4).toString("hex"),	// 8 characters
			consumed: false,
			expired: false,
		});
		backup_codes.push(code);
	}

	return backup_codes;
}