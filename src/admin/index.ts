import { RequestHandler, Router } from "express";
import { AdminAuthentication } from "./auth/AdminAuthentication";
import { listAdminAuditEvents, recordAdminAuditEvent } from "./audit";
import {
    getAdminConfiguration,
    getAdminDiscoveryGuild,
    getAdminGuild,
    getAdminUser,
    listAdminDiscoveryGuilds,
    listAdminGuilds,
    listAdminStickers,
    listAdminUserAttachments,
    listAdminUsers,
} from "./queries";
import { reloadAdminConfiguration, updateAdminConfiguration } from "./config";
import { getAdminJob, listAdminJobs, requestAdminJobCancellation } from "./jobs";
import { deleteAdminChannel, forceJoinAdminGuild, updateAdminDiscoveryGuild } from "./mutations";
import { parseBooleanQuery, parsePagination, parseQueryString } from "./pagination";
import { parseUserDeletionJobInput, startUserDeletionJob } from "./userDeletion";
import { parseCdnAttachmentJobInput, startCdnAttachmentFsckJob, startCdnAttachmentMigrationJob } from "./cdnJobs";

export interface AdminRouterOptions {
    authentication?: RequestHandler;
}

function listOptions(req: Parameters<RequestHandler>[0]) {
    return {
        ...parsePagination(req.query as Record<string, unknown>),
        q: parseQueryString(req.query.q),
    };
}

export function createAdminRouter(options: AdminRouterOptions = {}) {
    const router = Router({ mergeParams: true });
    const authentication = options.authentication ?? AdminAuthentication;

    router.use(authentication);

    router.get("/ping", (req, res) => {
        res.json({ ping: "pong!" });
    });

    router.get("/whoami", async (req, res) => {
        res.json({
            user: await getAdminUser(req.user_id),
            sessionId: req.session?.session_id ?? null,
            operator: true,
        });
    });

    router.get("/users", async (req, res) => {
        res.json(await listAdminUsers(listOptions(req)));
    });

    router.get("/users/:id", async (req, res) => {
        res.json(await getAdminUser(req.params.id));
    });

    router.post("/users/:id/delete", async (req, res) => {
        const idempotencyKey = Array.isArray(req.headers["idempotency-key"]) ? req.headers["idempotency-key"][0] : req.headers["idempotency-key"];
        const job = startUserDeletionJob({
            input: parseUserDeletionJobInput(req.params.id, req.body, req.query as Record<string, unknown>),
            createdBy: req.user_id,
            idempotencyKey,
        });
        recordAdminAuditEvent({
            action: "user.delete",
            actorId: req.user_id,
            targetType: "user",
            targetId: req.params.id,
            status: job.status === "queued" ? "accepted" : "succeeded",
            severity: "danger",
            jobId: job.id,
            metadata: { deleteMessages: job.input.deleteMessages, idempotencyKey: job.idempotencyKey },
        });

        res.status(job.status === "queued" ? 202 : 200).json(job);
    });

    router.get("/guilds", async (req, res) => {
        res.json(await listAdminGuilds(listOptions(req)));
    });

    router.get("/guilds/:id", async (req, res) => {
        res.json(await getAdminGuild(req.params.id));
    });

    router.post("/guilds/:id/force-join", async (req, res) => {
        const result = await forceJoinAdminGuild(req.params.id, req.body, req.user_id);
        recordAdminAuditEvent({
            action: "guild.force_join",
            actorId: req.user_id,
            targetType: "guild",
            targetId: req.params.id,
            status: "succeeded",
            severity: result.madeOwner || result.madeAdmin ? "warning" : "info",
            metadata: { ...result },
        });
        res.json(result);
    });

    router.get("/discovery/guilds", async (req, res) => {
        res.json(
            await listAdminDiscoveryGuilds({
                ...listOptions(req),
                includeExcluded: parseBooleanQuery(req.query.include_excluded),
            }),
        );
    });

    router.get("/discovery/guilds/:id", async (req, res) => {
        res.json(await getAdminDiscoveryGuild(req.params.id, parseBooleanQuery(req.query.include_excluded)));
    });

    router.patch("/discovery/guilds/:id", async (req, res) => {
        const result = await updateAdminDiscoveryGuild(req.params.id, req.body, parseBooleanQuery(req.query.include_excluded));
        recordAdminAuditEvent({
            action: "discovery.guild.update",
            actorId: req.user_id,
            targetType: "guild",
            targetId: req.params.id,
            status: "succeeded",
            severity: "warning",
            metadata: { discoveryWeight: result.discoveryWeight, discoveryExcluded: result.discoveryExcluded },
        });
        res.json(result);
    });

    router.get("/configuration", (req, res) => {
        res.json(getAdminConfiguration());
    });

    router.put("/configuration", async (req, res) => {
        const result = await updateAdminConfiguration(req.body);
        recordAdminAuditEvent({
            action: "configuration.update",
            actorId: req.user_id,
            targetType: "configuration",
            targetId: result.source,
            status: "succeeded",
            severity: "warning",
            metadata: { source: result.source, readonly: result.readonly },
        });
        res.json(result);
    });

    router.post("/configuration/reload", async (req, res) => {
        const result = await reloadAdminConfiguration();
        recordAdminAuditEvent({
            action: "configuration.reload",
            actorId: req.user_id,
            targetType: "configuration",
            targetId: result.source,
            status: "succeeded",
            severity: "info",
            metadata: { source: result.source },
        });
        res.json(result);
    });

    router.get("/media/stickers", async (req, res) => {
        res.json(await listAdminStickers(listOptions(req)));
    });

    router.get("/media/users/:id/attachments", async (req, res) => {
        res.json(await listAdminUserAttachments(req.params.id, listOptions(req)));
    });

    router.post("/media/attachments/fsck", (req, res) => {
        const idempotencyKey = Array.isArray(req.headers["idempotency-key"]) ? req.headers["idempotency-key"][0] : req.headers["idempotency-key"];
        const job = startCdnAttachmentFsckJob({
            input: parseCdnAttachmentJobInput(req.body, req.query as Record<string, unknown>),
            createdBy: req.user_id,
            idempotencyKey,
        });
        recordAdminAuditEvent({
            action: "cdn.attachments.fsck",
            actorId: req.user_id,
            targetType: "cdn",
            targetId: "attachments",
            status: job.status === "queued" ? "accepted" : "succeeded",
            severity: "warning",
            jobId: job.id,
            metadata: { dryRun: job.input.dryRun, force: job.input.force, idempotencyKey: job.idempotencyKey },
        });

        res.status(job.status === "queued" ? 202 : 200).json(job);
    });

    router.post("/media/attachments/migrate", (req, res) => {
        const idempotencyKey = Array.isArray(req.headers["idempotency-key"]) ? req.headers["idempotency-key"][0] : req.headers["idempotency-key"];
        const job = startCdnAttachmentMigrationJob({
            input: parseCdnAttachmentJobInput(req.body, req.query as Record<string, unknown>),
            createdBy: req.user_id,
            idempotencyKey,
        });
        recordAdminAuditEvent({
            action: "cdn.attachments.migrate",
            actorId: req.user_id,
            targetType: "cdn",
            targetId: "attachments",
            status: job.status === "queued" ? "accepted" : "succeeded",
            severity: job.input.dryRun ? "info" : "danger",
            jobId: job.id,
            metadata: { dryRun: job.input.dryRun, force: job.input.force, idempotencyKey: job.idempotencyKey },
        });

        res.status(job.status === "queued" ? 202 : 200).json(job);
    });

    router.delete("/channels/:id", async (req, res) => {
        const result = await deleteAdminChannel(req.params.id);
        recordAdminAuditEvent({
            action: "channel.delete",
            actorId: req.user_id,
            targetType: "channel",
            targetId: req.params.id,
            status: "succeeded",
            severity: "danger",
            metadata: { ...result },
        });
        res.json(result);
    });

    router.get("/activity", (req, res) => {
        res.json(
            listAdminAuditEvents({
                ...parsePagination(req.query as Record<string, unknown>),
                q: parseQueryString(req.query.q),
            }),
        );
    });

    router.get("/jobs", (req, res) => {
        res.json(
            listAdminJobs({
                ...parsePagination(req.query as Record<string, unknown>),
                q: parseQueryString(req.query.q),
            }),
        );
    });

    router.get("/jobs/:id", (req, res) => {
        res.json(getAdminJob(req.params.id));
    });

    router.post("/jobs/:id/cancel", (req, res) => {
        const result = requestAdminJobCancellation(req.params.id);
        recordAdminAuditEvent({
            action: "job.cancel",
            actorId: req.user_id,
            targetType: "job",
            targetId: req.params.id,
            status: "cancel_requested",
            severity: "warning",
            jobId: req.params.id,
            metadata: { jobStatus: result.status },
        });
        res.json(result);
    });

    router.use((req, res) => {
        res.status(404).json({
            message: "Admin endpoint not found",
            code: 404,
            request: `${req.method} ${req.originalUrl}`,
        });
    });

    return router;
}
