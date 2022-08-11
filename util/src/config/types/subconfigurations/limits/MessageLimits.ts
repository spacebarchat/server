export class MessageLimits {
    maxCharacters: number = 1048576;
    maxTTSCharacters: number = 160;
    maxReactions: number = 2048;
    maxAttachmentSize: number = 1024 * 1024 * 1024;
    maxBulkDelete: number = 1000;
    maxEmbedDownloadSize: number = 1024 * 1024 * 5;
}