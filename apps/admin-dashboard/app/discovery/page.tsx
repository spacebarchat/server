import { updateDiscoveryGuild } from "../actions";
import { ErrorBanner, PageHeader, Panel, SearchForm, StatusPill } from "../components";
import { queryString, safeAdminFetch } from "../lib/admin-api";
import type { AdminGuildListItem, PageResult } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function DiscoveryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    const guilds = await safeAdminFetch<PageResult<AdminGuildListItem>>(`/discovery/guilds${queryString({ q: params.q, include_excluded: true, limit: 50 })}`);

    return (
        <>
            <PageHeader title="Discovery" description="Rank and exclude discoverable guilds without editing raw entity records." />
            <ErrorBanner message={guilds.error} />
            <SearchForm defaultValue={params.q} placeholder="Search discoverable guilds" />
            <Panel title={`Discoverable Guilds${guilds.data ? ` · ${guilds.data.pagination.total}` : ""}`}>
                <table>
                    <thead>
                        <tr>
                            <th>Guild</th>
                            <th>Weight</th>
                            <th>Status</th>
                            <th>Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(guilds.data?.items ?? []).map((guild) => (
                            <tr key={guild.id}>
                                <td>
                                    <strong>{guild.name}</strong>
                                    <div className="mono">{guild.id}</div>
                                </td>
                                <td>{guild.discoveryWeight}</td>
                                <td>
                                    <StatusPill value={guild.discoveryExcluded ? "excluded" : "listed"} />
                                </td>
                                <td>
                                    <form action={updateDiscoveryGuild} className="inline-form">
                                        <input type="hidden" name="guildId" value={guild.id} />
                                        <input name="discoveryWeight" type="number" defaultValue={guild.discoveryWeight} aria-label="Discovery weight" />
                                        <label className="status-pill status-neutral">
                                            <input type="checkbox" name="discoveryExcluded" defaultChecked={guild.discoveryExcluded} />
                                            excluded
                                        </label>
                                        <button type="submit">Save</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </>
    );
}
