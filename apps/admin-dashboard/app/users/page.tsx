import { startUserDeletion } from "../actions";
import { ErrorBanner, PageHeader, Panel, RowLink, SearchForm, StatusPill } from "../components";
import { queryString, safeAdminFetch } from "../lib/admin-api";
import type { AdminUserListItem, PageResult } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    const users = await safeAdminFetch<PageResult<AdminUserListItem>>(`/users${queryString({ q: params.q, limit: 50 })}`);

    return (
        <>
            <PageHeader title="Users" description="Search accounts, inspect moderation state, and queue destructive account jobs." />
            <ErrorBanner message={users.error} />
            <SearchForm defaultValue={params.q} placeholder="Search id, username, or email" />
            <Panel title={`User Directory${users.data ? ` · ${users.data.pagination.total}` : ""}`}>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th className="hide-sm">Created</th>
                            <th>Status</th>
                            <th className="hide-sm">Rights</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(users.data?.items ?? []).map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <strong>{user.username}</strong>
                                    <div className="mono">{user.id}</div>
                                </td>
                                <td className="hide-sm">{user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</td>
                                <td>
                                    <div className="feature-list">
                                        {user.deleted ? <StatusPill value="deleted" /> : null}
                                        {user.disabled ? <StatusPill value="disabled" /> : null}
                                        {!user.deleted && !user.disabled ? <StatusPill value="active" /> : null}
                                    </div>
                                </td>
                                <td className="hide-sm mono">{user.rights}</td>
                                <td>
                                    <div className="row-actions">
                                        <form action={startUserDeletion} className="inline-form">
                                            <input type="hidden" name="userId" value={user.id} />
                                            <label className="status-pill status-neutral">
                                                <input type="checkbox" name="deleteMessages" defaultChecked />
                                                messages
                                            </label>
                                            <button className="danger" type="submit">
                                                Delete
                                            </button>
                                        </form>
                                        <RowLink href={`/users/${user.id}`} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </>
    );
}
