import { reloadConfiguration, updateConfiguration } from "../actions";
import { CodeBlock, DatabaseMode, ErrorBanner, PageHeader, Panel } from "../components";
import { safeAdminFetch } from "../lib/admin-api";
import type { AdminConfiguration } from "../lib/types";

export const dynamic = "force-dynamic";

export default async function ConfigurationPage() {
    const configuration = await safeAdminFetch<AdminConfiguration>("/configuration");
    const serialized = JSON.stringify(configuration.data?.values ?? {}, null, 2);

    return (
        <>
            <PageHeader
                title="Configuration"
                description="Edit the active server configuration through the same persistence mode used by the API process."
                action={
                    configuration.data ? (
                        <DatabaseMode source={configuration.data.source} readonly={configuration.data.readonly} />
                    ) : null
                }
            />
            <ErrorBanner message={configuration.error} />
            <div className="grid two">
                <Panel title="Editor">
                    <form action={updateConfiguration} className="panel-body grid">
                        <textarea name="configuration" defaultValue={serialized} spellCheck={false} />
                        <div className="row-actions">
                            <button type="submit" disabled={configuration.data?.readonly}>
                                Save Configuration
                            </button>
                        </div>
                    </form>
                </Panel>
                <Panel title="Runtime">
                    <div className="panel-body grid">
                        <form action={reloadConfiguration}>
                            <button type="submit" className="secondary">
                                Reload Configuration
                            </button>
                        </form>
                        <CodeBlock
                            value={{
                                source: configuration.data?.source ?? null,
                                path: configuration.data?.path ?? null,
                                readonly: configuration.data?.readonly ?? null,
                            }}
                        />
                    </div>
                </Panel>
            </div>
        </>
    );
}
