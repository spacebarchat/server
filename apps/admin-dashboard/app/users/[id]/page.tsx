import { startUserDeletion } from "../../actions";
import { CodeBlock, ErrorBanner, KeyValueList, PageHeader, Panel, StatusPill } from "../../components";
import { safeAdminFetch } from "../../lib/admin-api";
import type { AdminUser } from "../../lib/types";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await safeAdminFetch<AdminUser>(`/users/${id}`);

    return (
        <>
            <PageHeader
                title={user.data ? user.data.username : "User"}
                description={id}
                action={
                    <form action={startUserDeletion} className="inline-form">
                        <input type="hidden" name="userId" value={id} />
                        <label className="status-pill status-neutral">
                            <input type="checkbox" name="deleteMessages" defaultChecked />
                            messages
                        </label>
                        <button className="danger" type="submit">
                            Delete User
                        </button>
                    </form>
                }
            />
            <ErrorBanner message={user.error} />
            {user.data ? (
                <div className="grid two">
                    <Panel title="Profile">
                        <KeyValueList
                            items={[
                                ["ID", <span className="mono">{user.data.id}</span>],
                                ["Email", user.data.email ?? "—"],
                                ["Phone", user.data.phone ?? "—"],
                                ["Verified", <StatusPill value={user.data.verified} />],
                                ["Disabled", <StatusPill value={user.data.disabled} />],
                                ["Deleted", <StatusPill value={user.data.deleted} />],
                                ["MFA", <StatusPill value={user.data.mfaEnabled} />],
                                ["WebAuthn", <StatusPill value={user.data.webauthnEnabled} />],
                            ]}
                        />
                    </Panel>
                    <Panel title="Counts">
                        <CodeBlock value={user.data.counts} />
                    </Panel>
                </div>
            ) : null}
        </>
    );
}
