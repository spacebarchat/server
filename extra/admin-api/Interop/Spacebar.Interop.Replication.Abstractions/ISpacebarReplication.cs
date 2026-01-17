namespace Spacebar.Interop.Replication.Abstractions;

public interface ISpacebarReplication {
    public Task InitializeAsync();
    public Task SendAsync(ReplicationMessage message);
}