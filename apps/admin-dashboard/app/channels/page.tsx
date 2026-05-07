import { deleteChannel } from "../actions";
import { PageHeader, Panel } from "../components";

export const dynamic = "force-dynamic";

export default function ChannelsPage() {
    return (
        <>
            <PageHeader title="Channels" description="Run targeted channel deletion through the admin API event boundary." />
            <Panel title="Delete Channel">
                <form action={deleteChannel} className="panel-body grid">
                    <input name="channelId" placeholder="Channel ID" />
                    <div className="row-actions">
                        <button className="danger" type="submit">
                            Delete Channel
                        </button>
                    </div>
                </form>
            </Panel>
        </>
    );
}
