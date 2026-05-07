import { cancelJob } from "../actions";
import { CodeBlock, ErrorBanner, PageHeader, Panel, StatusPill } from "../components";
import { queryString, safeAdminFetch } from "../lib/admin-api";
import type { AdminJob, PageResult } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
    const jobs = await safeAdminFetch<PageResult<AdminJob>>(`/jobs${queryString({ limit: 50 })}`);

    return (
        <>
            <PageHeader title="Jobs" description="Track destructive and long-running admin work with progress, errors, and cancellation requests." />
            <ErrorBanner message={jobs.error} />
            <Panel title={`Job Queue${jobs.data ? ` · ${jobs.data.pagination.total}` : ""}`}>
                <table>
                    <thead>
                        <tr>
                            <th>Job</th>
                            <th>Status</th>
                            <th>Progress</th>
                            <th className="hide-sm">Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(jobs.data?.items ?? []).map((job) => (
                            <tr key={job.id}>
                                <td>
                                    <strong>{job.type}</strong>
                                    <div className="mono">{job.id}</div>
                                </td>
                                <td>
                                    <StatusPill value={job.status} />
                                </td>
                                <td>
                                    {job.progress.label ? <div>{job.progress.label}</div> : null}
                                    <span className="mono">
                                        {job.progress.current}
                                        {job.progress.total === null ? "" : ` / ${job.progress.total}`}
                                    </span>
                                </td>
                                <td className="hide-sm">{new Date(job.updatedAt).toLocaleString()}</td>
                                <td>
                                    <div className="row-actions">
                                        {job.status === "queued" || job.status === "running" ? (
                                            <form action={cancelJob}>
                                                <input type="hidden" name="jobId" value={job.id} />
                                                <button type="submit" className="secondary">
                                                    Cancel
                                                </button>
                                            </form>
                                        ) : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
            <Panel title="Latest Payloads">
                <CodeBlock value={(jobs.data?.items ?? []).slice(0, 3)} />
            </Panel>
        </>
    );
}
