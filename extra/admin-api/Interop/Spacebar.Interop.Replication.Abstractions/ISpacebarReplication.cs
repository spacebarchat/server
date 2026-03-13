namespace Spacebar.Interop.Replication.Abstractions;

public interface ISpacebarReplication {
    public Task InitializeAsync();
    public Task SendAsync(ContentlessReplicationMessage message);
    public Task SendAsync<TPayload>(ReplicationMessage<TPayload> message);
}
