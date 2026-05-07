import { ErrorBanner, PageHeader, Panel, RowLink, SearchForm, StatusPill } from "../components";
import { queryString, safeAdminFetch } from "../lib/admin-api";
import type { AdminGuildListItem, PageResult } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function GuildsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    const guilds = await safeAdminFetch<PageResult<AdminGuildListItem>>(`/guilds${queryString({ q: params.q, limit: 50 })}`);

    return (
        <>
            <PageHeader title="Guilds" description="Inspect instance guilds, ownership, discovery posture, and aggregate size." />
            <ErrorBanner message={guilds.error} />
            <SearchForm defaultValue={params.q} placeholder="Search id, name, or owner" />
            <Panel title={`Guild Directory${guilds.data ? ` · ${guilds.data.pagination.total}` : ""}`}>
                <table>
                    <thead>
                        <tr>
                            <th>Guild</th>
                            <th>Owner</th>
                            <th>Members</th>
                            <th className="hide-sm">Discovery</th>
                            <th aria-label="Open" />
                        </tr>
                    </thead>
                    <tbody>
                        {(guilds.data?.items ?? []).map((guild) => (
                            <tr key={guild.id}>
                                <td>
                                    <strong>{guild.name}</strong>
                                    <div className="mono">{guild.id}</div>
                                </td>
                                <td className="mono">{guild.ownerId ?? "—"}</td>
                                <td>{guild.memberCount ?? "—"}</td>
                                <td className="hide-sm">
                                    <StatusPill value={guild.discoveryExcluded ? "excluded" : "eligible"} />
                                </td>
                                <td>
                                    <RowLink href={`/guilds/${guild.id}`} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </>
    );
}
