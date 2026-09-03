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

import { Column, Entity, Index, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { User } from "./User";
import { AuditLogChange, AuditLogChangeValue, AuditLogEntry, AuditLogEvents } from "@spacebar/schemas";

@Entity({
    name: "audit_logs",
})
export class AuditLog extends BaseClass {
    @Column({ nullable: true })
    @RelationId((auditlog: AuditLog) => auditlog.guild)
    @Index("IDX_audit_log_guild_id")
    guild_id: string;

    @JoinColumn({ name: "guild_id", foreignKeyConstraintName: "FK_audit_log_guild_id" })
    @ManyToOne(() => Guild)
    guild?: Guild;

    @Column({ nullable: true })
    @RelationId((auditlog: AuditLog) => auditlog.target)
    target_id?: string;

    @JoinColumn({ name: "target_id", foreignKeyConstraintName: "FK_audit_log_target_user_id" })
    @ManyToOne(() => User)
    target?: User;

    @Column({ nullable: true })
    @RelationId((auditlog: AuditLog) => auditlog.user)
    user_id?: string;

    @JoinColumn({ name: "user_id", foreignKeyConstraintName: "FK_audit_log_source_user_id" })
    @ManyToOne(() => User, (user: User) => user.id)
    user?: User;

    @Column({ type: "int" })
    action_type: AuditLogEvents;

    @Column({ type: "jsonb", nullable: true })
    options?: {
        delete_member_days?: string;
        members_removed?: string;
        channel_id?: string;
        message_id?: string;
        count?: string;
        id?: string;
        type?: string;
        role_name?: string;
    };

    @Column({ type: "jsonb" })
    changes: AuditLogChange[];

    @Column({ nullable: true })
    reason?: string;

    toAuditLogEntry(): AuditLogEntry {
        return {
            id: this.id,
            action_type: this.action_type,
            reason: this.reason,
            user_id: this.user_id,
            target_id: this.target_id,
            options: this.options,
            changes: this.changes,
        } satisfies AuditLogEntry;
    }

    static async createAuditLog(options: {
        guild_id: string;
        user_id: string;
        target_id?: string;
        action_type: AuditLogEvents;
        changes?: AuditLogChange[];
        reason?: string;
    }): Promise<AuditLog> {
        const entry = AuditLog.create({
            guild_id: options.guild_id,
            user_id: options.user_id,
            target_id: options.target_id,
            action_type: options.action_type,
            changes: options.changes ?? [],
            reason: options.reason,
        });
        return entry.save();
    }

    static computeChanges<T extends object>(oldValue: Partial<T>, newValue: T, keys: (keyof T)[]): AuditLogChange[] {
        return keys.flatMap((key) => {
            const oldVal = oldValue[key] as unknown;
            const newVal = newValue[key] as unknown;
            if (oldVal === newVal) return [];
            return [
                {
                    key: key as string,
                    ...(oldVal !== undefined && oldVal !== null ? { old_value: oldVal as AuditLogChangeValue } : {}),
                    ...(newVal !== undefined && newVal !== null ? { new_value: newVal as AuditLogChangeValue } : {}),
                },
            ];
        });
    }
}
