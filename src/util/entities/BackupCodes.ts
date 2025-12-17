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

import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";
import crypto from "crypto";
import { Config } from "../util";

@Entity({
    name: "backup_codes",
})
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
    const backup_codes: BackupCode[] = [];
    for (let i = 0; i < Config.get().security.mfaBackupCodeCount; i++) {
        const code = BackupCode.create({
            user: { id: user_id },
            code: crypto.randomBytes(4).toString("hex"), // 8 characters
            consumed: false,
            expired: false,
        });
        backup_codes.push(code);
    }

    return backup_codes;
}
