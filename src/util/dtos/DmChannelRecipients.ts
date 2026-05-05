export function excludeDmChannelRecipient<T extends { id: string }>(recipients: T[], recipient_id: string): T[] {
    return recipients.filter((recipient) => recipient.id !== recipient_id);
}
