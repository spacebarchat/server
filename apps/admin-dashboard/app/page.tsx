import { ErrorBanner, Metric, PageHeader, Panel, RowLink, StatusPill } from "./components";
import { queryString, safeAdminFetch } from "./lib/admin-api";
import type { AdminConfiguration, AdminGuildListItem, AdminJob, AdminSticker, AdminUserListItem, PageResult } from "./lib/types";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
    const [users, guilds, stickers, jobs, configuration] = await Promise.all([
        safeAdminFetch<PageResult<AdminUserListItem>>(`/users${queryString({ limit: 1 })}`),
        safeAdminFetch<PageResult<AdminGuildListItem>>(`/guilds${queryString({ limit: 1 })}`),
        safeAdminFetch<PageResult<AdminSticker>>(`/media/stickers${queryString({ limit: 1 })}`),
        safeAdminFetch<PageResult<AdminJob>>(`/jobs${queryString({ limit: 100 })}`),
        safeAdminFetch<AdminConfiguration>("/configuration"),
    ]);

    const firstError = users.error ?? guilds.error ?? stickers.error ?? jobs.error ?? configuration.error;
    const activeJobs = jobs.data?.items.filter((job) => job.status === "queued" || job.status === "running").length ?? 0;

    return (
        <>
            <PageHeader title="Overview" description="Instance operations, privileged queues, and service configuration state." />
            <ErrorBanner message={firstError} />
            <section className="metric-row">
                <Metric label="Users" value={users.data?.pagination.total ?? "—"} />
                <Metric label="Guilds" value={guilds.data?.pagination.total ?? "—"} />
                <Metric label="Stickers" value={stickers.data?.pagination.total ?? "—"} />
                <Metric label="Active Jobs" value={activeJobs} tone={activeJobs > 0 ? "warn" : "good"} />
            </section>
            <div className="grid two">
                <Panel title="Recent Jobs">
                    {jobs.data?.items.length ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th aria-label="Open" />
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.data.items.slice(0, 6).map((job) => (
                                    <tr key={job.id}>
                                        <td className="mono">{job.type}</td>
                                        <td>
                                            <StatusPill value={job.status} />
                                        </td>
                                        <td>
                                            {job.progress.current}
                                            {job.progress.total === null ? "" : ` / ${job.progress.total}`}
                                        </td>
                                        <td>
                                            <RowLink href="/jobs" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="panel-body muted">No job history.</div>
                    )}
                </Panel>
                <Panel title="Configuration">
                    <div className="panel-body">
                        <div className="grid">
                            <Metric label="Source" value={configuration.data?.source ?? "—"} />
                            <Metric label="Readonly" value={configuration.data?.readonly ? "yes" : "no"} tone={configuration.data?.readonly ? "warn" : "good"} />
                        </div>
                    </div>
                </Panel>
            </div>
        </>
    );
}
