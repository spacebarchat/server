import { CodeBlock, ErrorBanner, PageHeader, Panel, StatusPill } from "../components";
import { safeAdminFetch } from "../lib/admin-api";
import type { AdminAuditRecord, PageResult } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
    const activity = await safeAdminFetch<PageResult<AdminAuditRecord>>("/activity?limit=100");

    return (
        <>
            <PageHeader title="Activity" description="Admin audit activity with actor, target, status, and operation metadata." />
            <ErrorBanner message={activity.error} />
            <Panel title="Activity Feed">
                <table>
                    <thead>
                        <tr>
                            <th>When</th>
                            <th>Actor</th>
                            <th>Operation</th>
                            <th>Status</th>
                            <th className="hide-sm">Errors</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(activity.data?.items ?? []).map((record) => (
                            <tr key={record.id}>
                                <td>{new Date(record.createdAt).toLocaleString()}</td>
                                <td className="mono">{record.actorId}</td>
                                <td>
                                    <strong>{record.action}</strong>
                                    <div className="mono">
                                        {record.targetType}:{record.targetId}
                                    </div>
                                </td>
                                <td>
                                    <StatusPill value={record.status} />
                                </td>
                                <td className="hide-sm">{record.severity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
            <Panel title="Recent Activity Payloads">
                <CodeBlock value={(activity.data?.items ?? []).slice(0, 10)} />
            </Panel>
        </>
    );
}
