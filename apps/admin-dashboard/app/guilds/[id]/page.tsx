import { forceJoinGuild } from "../../actions";
import { CodeBlock, ErrorBanner, KeyValueList, PageHeader, Panel, StatusPill } from "../../components";
import { safeAdminFetch } from "../../lib/admin-api";
import type { AdminGuild } from "../../lib/types";

export const dynamic = "force-dynamic";

export default async function GuildDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const guild = await safeAdminFetch<AdminGuild>(`/guilds/${id}`);

    return (
        <>
            <PageHeader title={guild.data ? guild.data.name : "Guild"} description={id} />
            <ErrorBanner message={guild.error} />
            {guild.data ? (
                <div className="grid two">
                    <Panel title="Guild State">
                        <KeyValueList
                            items={[
                                ["Owner", <span className="mono">{guild.data.ownerId ?? "—"}</span>],
                                ["Members", guild.data.memberCount ?? "—"],
                                ["Presence", guild.data.presenceCount ?? "—"],
                                ["Locale", guild.data.preferredLocale ?? "—"],
                                ["NSFW", <StatusPill value={guild.data.nsfw} />],
                                ["Discovery Excluded", <StatusPill value={guild.data.discoveryExcluded} />],
                            ]}
                        />
                    </Panel>
                    <Panel title="Aggregate Counts">
                        <CodeBlock value={guild.data.counts} />
                    </Panel>
                    <Panel title="Features">
                        <div className="panel-body feature-list">
                            {guild.data.features.length ? guild.data.features.map((feature) => <span key={feature}>{feature}</span>) : <span>none</span>}
                        </div>
                    </Panel>
                    <Panel title="Channel Ordering">
                        <CodeBlock value={guild.data.channelOrdering} />
                    </Panel>
                    <Panel title="Force Join">
                        <form action={forceJoinGuild} className="panel-body grid">
                            <input type="hidden" name="guildId" value={id} />
                            <input name="userId" placeholder="User ID; blank uses current operator" />
                            <div className="inline-form">
                                <label className="status-pill status-neutral">
                                    <input type="checkbox" name="makeOwner" />
                                    owner
                                </label>
                                <label className="status-pill status-neutral">
                                    <input type="checkbox" name="makeAdmin" />
                                    admin
                                </label>
                            </div>
                            <div className="row-actions">
                                <button type="submit">Force Join</button>
                            </div>
                        </form>
                    </Panel>
                </div>
            ) : null}
        </>
    );
}
