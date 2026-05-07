import { randomUUID } from "node:crypto";
import { Page, paginated } from "./pagination";

export type AdminAuditStatus = "accepted" | "succeeded" | "failed" | "cancel_requested";
export type AdminAuditSeverity = "info" | "warning" | "danger";

export interface AdminAuditRecord {
    id: string;
    action: string;
    actorId: string;
    targetType: string;
    targetId: string;
    status: AdminAuditStatus;
    severity: AdminAuditSeverity;
    metadata: Record<string, unknown>;
    jobId: string | null;
    createdAt: string;
}

export interface CreateAdminAuditRecord {
    action: string;
    actorId: string;
    targetType: string;
    targetId: string;
    status: AdminAuditStatus;
    severity?: AdminAuditSeverity;
    metadata?: Record<string, unknown>;
    jobId?: string | null;
}

export interface AdminAuditListOptions extends Page {
    q?: string;
}

const MAX_AUDIT_RECORDS = 1000;
const records: AdminAuditRecord[] = [];

export function recordAdminAuditEvent(input: CreateAdminAuditRecord): AdminAuditRecord {
    const record: AdminAuditRecord = {
        id: randomUUID(),
        action: input.action,
        actorId: input.actorId,
        targetType: input.targetType,
        targetId: input.targetId,
        status: input.status,
        severity: input.severity ?? "info",
        metadata: input.metadata ?? {},
        jobId: input.jobId ?? null,
        createdAt: new Date().toISOString(),
    };

    records.unshift(record);
    if (records.length > MAX_AUDIT_RECORDS) records.length = MAX_AUDIT_RECORDS;

    return { ...record, metadata: { ...record.metadata } };
}

export function listAdminAuditEvents(options: AdminAuditListOptions) {
    const q = options.q?.toLowerCase();
    const filtered = q
        ? records.filter(
              (record) =>
                  record.action.toLowerCase().includes(q) ||
                  record.actorId.includes(q) ||
                  record.targetId.includes(q) ||
                  record.targetType.toLowerCase().includes(q) ||
                  record.status.includes(q),
          )
        : records;

    return paginated(
        filtered.slice(options.offset, options.offset + options.limit).map((record) => ({
            ...record,
            metadata: { ...record.metadata },
        })),
        filtered.length,
        options,
    );
}

export function clearAdminAuditEventsForTests() {
    records.length = 0;
}
