using Spacebar.Interop.Cdn.Abstractions;

namespace Spacebar.Cdn.Fsck;

public class MigrationFileStores {
    public required IFileSource From { get; init; }
    public required IFileSource To { get; init; }
}