import crypto from "crypto";
import { Config } from ".";
import { BackupCode } from "../entities/BackupCodes";

export function generateMfaBackupCodes(user_id: string) {
	let backup_codes: BackupCode[] = [];
	for (let i = 0; i < Config.get().security.mfaBackupCodeCount; i++) {
		const code = BackupCode.create({
			user: { id: user_id },
			code: crypto.randomBytes(4).toString("hex"), // 8 characters
			consumed: false,
			expired: false
		});
		backup_codes.push(code);
	}

	return backup_codes;
}
