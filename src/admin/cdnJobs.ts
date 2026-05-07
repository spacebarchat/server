import { storage as defaultStorage, type Storage } from "@spacebar/cdn";
import { Attachment } from "@spacebar/util";
import { IsNull, Not } from "typeorm";
import { AdminJobContext, AdminJobSnapshot, createAdminJob } from "./jobs";

export interface CdnAttachmentJobInput {
    dryRun: boolean;
    force: boolean;
    missingLimit: number;
}

export interface CdnAttachmentJobResult {
    checked: number;
    missing: number;
    present: number;
    migrated: number;
    alreadyCurrent: number;
    skipped: boolean;
    markerPath: string;
    missingPaths: string[];
}

export interface CdnAttachmentRow {
    id: string;
    channelId: string;
    messageId: string;
    filename: string;
}

export interface CdnAttachmentJobDependencies {
    storage: Pick<Storage, "exists" | "move" | "set">;
    countRows: () => Promise<number>;
    streamRows: () => Promise<AsyncIterable<CdnAttachmentRow>>;
}

const ATTACHMENT_MIGRATION_MARKER = ".mig_complete.attachments1";
const DEFAULT_MISSING_LIMIT = 50;
const MAX_MISSING_LIMIT = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstQueryValue(value: unknown): string | undefined {
    if (Array.isArray(value)) return firstQueryValue(value[0]);
    return typeof value === "string" ? value : undefined;
}

function parseBoolean(value: unknown, fallback = false) {
    if (value === undefined) return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return ["1", "true", "yes", "on"].includes(value.toLowerCase());
    return fallback;
}

function parseMissingLimit(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value)) return Math.min(Math.max(Math.trunc(value), 0), MAX_MISSING_LIMIT);

    const raw = firstQueryValue(value);
    const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_MISSING_LIMIT;
    if (!Number.isFinite(parsed)) return DEFAULT_MISSING_LIMIT;

    return Math.min(Math.max(parsed, 0), MAX_MISSING_LIMIT);
}

export function parseCdnAttachmentJobInput(body: unknown, query: Record<string, unknown> = {}): CdnAttachmentJobInput {
    const input = isRecord(body) ? body : {};

    return {
        dryRun: parseBoolean(input.dryRun ?? input.dry_run ?? query.dryRun ?? query.dry_run),
        force: parseBoolean(input.force ?? query.force),
        missingLimit: parseMissingLimit(input.missingLimit ?? input.missing_limit ?? query.missingLimit ?? query.missing_limit),
    };
}

function currentAttachmentPath(row: CdnAttachmentRow) {
    return `attachments/${row.channelId}/${row.messageId}/${row.filename}`;
}

function legacyAttachmentPath(row: CdnAttachmentRow) {
    return `attachments/${row.channelId}/${row.id}/${row.filename}`;
}

async function countAttachmentRows() {
    return Attachment.count({
        where: {
            message_id: Not(IsNull()),
            channel_id: Not(IsNull()),
        },
    });
}

async function streamAttachmentRows() {
    return (await Attachment.createQueryBuilder("attachment")
        .select("attachment.id", "id")
        .addSelect("attachment.channel_id", "channelId")
        .addSelect("attachment.message_id", "messageId")
        .addSelect("attachment.filename", "filename")
        .where("attachment.message_id IS NOT NULL")
        .andWhere("attachment.channel_id IS NOT NULL")
        .stream()) as AsyncIterable<CdnAttachmentRow>;
}

function defaultDependencies(): CdnAttachmentJobDependencies {
    return {
        storage: defaultStorage,
        countRows: countAttachmentRows,
        streamRows: streamAttachmentRows,
    };
}

function recordMissingPath(result: CdnAttachmentJobResult, path: string, context: AdminJobContext<CdnAttachmentJobResult>, input: CdnAttachmentJobInput) {
    result.missing += 1;
    if (result.missingPaths.length < input.missingLimit) result.missingPaths.push(path);
    if (result.missing <= input.missingLimit) context.addError(`Missing CDN attachment file: ${path}`);
}

function emptyResult(): CdnAttachmentJobResult {
    return {
        checked: 0,
        missing: 0,
        present: 0,
        migrated: 0,
        alreadyCurrent: 0,
        skipped: false,
        markerPath: ATTACHMENT_MIGRATION_MARKER,
        missingPaths: [],
    };
}

export async function runCdnAttachmentFsckJob(
    input: CdnAttachmentJobInput,
    context: AdminJobContext<CdnAttachmentJobResult>,
    dependencies: CdnAttachmentJobDependencies = defaultDependencies(),
): Promise<CdnAttachmentJobResult> {
    const total = await dependencies.countRows();
    const result = emptyResult();
    context.setProgress({ current: 0, total, label: "Checking CDN attachments" });

    for await (const row of await dependencies.streamRows()) {
        context.throwIfCancellationRequested();
        result.checked += 1;
        const path = currentAttachmentPath(row);

        if (await dependencies.storage.exists(path)) result.present += 1;
        else recordMissingPath(result, path, context, input);

        context.setProgress({ current: result.checked });
    }

    context.setProgress({ current: result.checked, total, label: "Complete" });
    return result;
}

export async function runCdnAttachmentMigrationJob(
    input: CdnAttachmentJobInput,
    context: AdminJobContext<CdnAttachmentJobResult>,
    dependencies: CdnAttachmentJobDependencies = defaultDependencies(),
): Promise<CdnAttachmentJobResult> {
    const result = emptyResult();

    if (!input.force && (await dependencies.storage.exists(ATTACHMENT_MIGRATION_MARKER))) {
        result.skipped = true;
        context.setProgress({ current: 0, total: 0, label: "Migration marker already exists" });
        return result;
    }

    const total = await dependencies.countRows();
    context.setProgress({ current: 0, total, label: input.dryRun ? "Planning CDN attachment migration" : "Migrating CDN attachments" });

    for await (const row of await dependencies.streamRows()) {
        context.throwIfCancellationRequested();
        result.checked += 1;

        const currentPath = currentAttachmentPath(row);
        if (await dependencies.storage.exists(currentPath)) {
            result.present += 1;
            result.alreadyCurrent += 1;
            context.setProgress({ current: result.checked });
            continue;
        }

        const legacyPath = legacyAttachmentPath(row);
        if (!(await dependencies.storage.exists(legacyPath))) {
            recordMissingPath(result, legacyPath, context, input);
            context.setProgress({ current: result.checked });
            continue;
        }

        if (!input.dryRun) await dependencies.storage.move(legacyPath, currentPath);
        result.migrated += 1;
        result.present += 1;
        context.setProgress({ current: result.checked });
    }

    if (!input.dryRun) await dependencies.storage.set(ATTACHMENT_MIGRATION_MARKER, Buffer.from([1]));
    context.setProgress({ current: result.checked, total, label: "Complete" });
    return result;
}

export function startCdnAttachmentFsckJob(options: {
    input: CdnAttachmentJobInput;
    createdBy: string;
    idempotencyKey?: string | null;
}): AdminJobSnapshot<CdnAttachmentJobInput, CdnAttachmentJobResult> {
    return createAdminJob({
        type: "cdn.attachments.fsck",
        input: options.input,
        createdBy: options.createdBy,
        idempotencyKey: options.idempotencyKey,
        runner: (context) => runCdnAttachmentFsckJob(options.input, context),
    });
}

export function startCdnAttachmentMigrationJob(options: {
    input: CdnAttachmentJobInput;
    createdBy: string;
    idempotencyKey?: string | null;
}): AdminJobSnapshot<CdnAttachmentJobInput, CdnAttachmentJobResult> {
    return createAdminJob({
        type: "cdn.attachments.migrate",
        input: options.input,
        createdBy: options.createdBy,
        idempotencyKey: options.idempotencyKey,
        runner: (context) => runCdnAttachmentMigrationJob(options.input, context),
    });
}
