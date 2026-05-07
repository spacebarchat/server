import { startCdnAttachmentFsck, startCdnAttachmentMigration } from "../actions";
import { ErrorBanner, PageHeader, Panel, SearchForm, StatusPill } from "../components";
import { queryString, safeAdminFetch } from "../lib/admin-api";
import type { AdminAttachment, AdminSticker, PageResult } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string; userId?: string }> }) {
    const params = await searchParams;
    const [stickers, attachments] = await Promise.all([
        safeAdminFetch<PageResult<AdminSticker>>(`/media/stickers${queryString({ q: params.q, limit: 50 })}`),
        params.userId ? safeAdminFetch<PageResult<AdminAttachment>>(`/media/users/${params.userId}/attachments${queryString({ q: params.q, limit: 50 })}`) : Promise.resolve({ data: null, error: null }),
    ]);

    return (
        <>
            <PageHeader title="Media" description="Review stickers and media ownership without loading attachment graphs." />
            <ErrorBanner message={stickers.error ?? attachments.error} />
            <SearchForm defaultValue={params.q} placeholder="Search sticker id, name, guild, or user" />
            <div className="grid">
                <Panel title="Attachment Jobs">
                    <div className="panel-body grid two">
                        <form action={startCdnAttachmentFsck} className="stack">
                            <input type="hidden" name="missingLimit" value="50" />
                            <button type="submit" className="secondary">
                                Start Fsck
                            </button>
                        </form>
                        <form action={startCdnAttachmentMigration} className="stack">
                            <input type="hidden" name="missingLimit" value="50" />
                            <label className="check-row">
                                <input type="checkbox" name="dryRun" defaultChecked />
                                Dry run
                            </label>
                            <label className="check-row">
                                <input type="checkbox" name="force" />
                                Force
                            </label>
                            <button type="submit">Start Migration</button>
                        </form>
                    </div>
                </Panel>
                <Panel title={`Stickers${stickers.data ? ` · ${stickers.data.pagination.total}` : ""}`}>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Guild</th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stickers.data?.items ?? []).map((sticker) => (
                                <tr key={sticker.id}>
                                    <td>
                                        <strong>{sticker.name}</strong>
                                        <div className="mono">{sticker.id}</div>
                                    </td>
                                    <td className="mono">{sticker.guildId ?? "—"}</td>
                                    <td className="mono">{sticker.userId ?? "—"}</td>
                                    <td>
                                        {sticker.type}/{sticker.formatType}
                                    </td>
                                    <td>
                                        <StatusPill value={sticker.available ?? "unknown"} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Panel>
                <Panel title={`User Attachments${attachments.data ? ` · ${attachments.data.pagination.total}` : ""}`}>
                    <form className="panel-body search-form">
                        <span />
                        <input name="userId" defaultValue={params.userId} placeholder="User ID" />
                        <button type="submit">Load</button>
                    </form>
                    {attachments.data ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Size</th>
                                    <th>Channel</th>
                                    <th className="hide-sm">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attachments.data.items.map((attachment) => (
                                    <tr key={attachment.id}>
                                        <td>
                                            <strong>{attachment.filename}</strong>
                                            <div className="mono">{attachment.id}</div>
                                        </td>
                                        <td>{attachment.size.toLocaleString()}</td>
                                        <td className="mono">{attachment.channelId ?? "—"}</td>
                                        <td className="hide-sm">{attachment.timestamp ? new Date(attachment.timestamp).toLocaleString() : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}
                </Panel>
            </div>
        </>
    );
}
