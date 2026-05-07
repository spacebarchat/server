import { randomUUID } from "node:crypto";
import { HTTPError } from "lambert-server";
import { Page, paginated } from "./pagination";

export type AdminJobStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export interface AdminJobProgress {
    current: number;
    total: number | null;
    label: string | null;
}

export interface AdminJobSnapshot<TInput = unknown, TResult = unknown> {
    id: string;
    type: string;
    status: AdminJobStatus;
    input: TInput;
    result: TResult | null;
    progress: AdminJobProgress;
    errors: string[];
    cancelRequested: boolean;
    idempotencyKey: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    startedAt: string | null;
    completedAt: string | null;
}

export interface AdminJobContext<TResult = unknown> {
    readonly job: AdminJobSnapshot<unknown, TResult>;
    setProgress(progress: Partial<AdminJobProgress>): void;
    addError(error: unknown): void;
    throwIfCancellationRequested(): void;
}

export type AdminJobRunner<TResult = unknown> = (context: AdminJobContext<TResult>) => Promise<TResult>;

interface AdminJobRecord<TInput = unknown, TResult = unknown> extends AdminJobSnapshot<TInput, TResult> {
    runner: AdminJobRunner<TResult>;
}

export interface CreateAdminJobOptions<TInput = unknown, TResult = unknown> {
    type: string;
    input: TInput;
    createdBy: string;
    idempotencyKey?: string | null;
    runner: AdminJobRunner<TResult>;
}

export interface AdminJobListOptions extends Page {
    q?: string;
}

// Jobs may carry different input/result types; snapshots keep the typed surface at call sites.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jobs = new Map<string, AdminJobRecord<any, any>>();
const idempotencyIndex = new Map<string, string>();

function now() {
    return new Date().toISOString();
}

function snapshot<TInput, TResult>(job: AdminJobRecord<TInput, TResult>): AdminJobSnapshot<TInput, TResult> {
    return {
        id: job.id,
        type: job.type,
        status: job.status,
        input: job.input,
        result: job.result,
        progress: { ...job.progress },
        errors: [...job.errors],
        cancelRequested: job.cancelRequested,
        idempotencyKey: job.idempotencyKey,
        createdBy: job.createdBy,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
    };
}

function jobErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runJob(job: AdminJobRecord<any, any>) {
    if (job.cancelRequested) {
        job.status = "cancelled";
        job.completedAt = now();
        job.updatedAt = job.completedAt;
        return;
    }

    job.status = "running";
    job.startedAt = now();
    job.updatedAt = job.startedAt;

    const context: AdminJobContext = {
        job,
        setProgress(progress) {
            job.progress = { ...job.progress, ...progress };
            job.updatedAt = now();
        },
        addError(error) {
            job.errors.push(jobErrorMessage(error));
            job.updatedAt = now();
        },
        throwIfCancellationRequested() {
            if (job.cancelRequested) throw new HTTPError("Job cancellation requested", 499);
        },
    };

    try {
        job.result = await job.runner(context);
        job.status = job.cancelRequested ? "cancelled" : "succeeded";
    } catch (error) {
        if (job.cancelRequested) {
            job.status = "cancelled";
        } else {
            job.status = "failed";
            context.addError(error);
        }
    } finally {
        job.completedAt = now();
        job.updatedAt = job.completedAt;
    }
}

function idempotencyIndexKey(type: string, key: string) {
    return `${type}:${key}`;
}

export function createAdminJob<TInput, TResult>(options: CreateAdminJobOptions<TInput, TResult>): AdminJobSnapshot<TInput, TResult> {
    const idempotencyKey = options.idempotencyKey?.trim() || null;
    if (idempotencyKey) {
        const existingId = idempotencyIndex.get(idempotencyIndexKey(options.type, idempotencyKey));
        const existing = existingId ? jobs.get(existingId) : undefined;
        if (existing) return snapshot(existing as AdminJobRecord<TInput, TResult>);
    }

    const createdAt = now();
    const job: AdminJobRecord<TInput, TResult> = {
        id: randomUUID(),
        type: options.type,
        status: "queued",
        input: options.input,
        result: null,
        progress: {
            current: 0,
            total: null,
            label: null,
        },
        errors: [],
        cancelRequested: false,
        idempotencyKey,
        createdBy: options.createdBy,
        createdAt,
        updatedAt: createdAt,
        startedAt: null,
        completedAt: null,
        runner: options.runner,
    };

    jobs.set(job.id, job);
    if (idempotencyKey) idempotencyIndex.set(idempotencyIndexKey(options.type, idempotencyKey), job.id);

    setImmediate(() => void runJob(job));

    return snapshot(job);
}

export function listAdminJobs(options: AdminJobListOptions) {
    const q = options.q?.toLowerCase();
    const sorted = [...jobs.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const filtered = q
        ? sorted.filter(
              (job) =>
                  job.id.includes(q) || job.type.toLowerCase().includes(q) || job.status.includes(q) || job.createdBy.includes(q) || job.idempotencyKey?.toLowerCase().includes(q),
          )
        : sorted;

    return paginated(
        filtered.slice(options.offset, options.offset + options.limit).map((job) => snapshot(job)),
        filtered.length,
        options,
    );
}

export function getAdminJob(id: string): AdminJobSnapshot {
    const job = jobs.get(id);
    if (!job) throw new HTTPError("Job not found", 404);

    return snapshot(job);
}

export function requestAdminJobCancellation(id: string): AdminJobSnapshot {
    const job = jobs.get(id);
    if (!job) throw new HTTPError("Job not found", 404);

    if (job.status === "queued" || job.status === "running") {
        job.cancelRequested = true;
        job.updatedAt = now();
    }

    return snapshot(job);
}

export function clearAdminJobsForTests() {
    jobs.clear();
    idempotencyIndex.clear();
}
