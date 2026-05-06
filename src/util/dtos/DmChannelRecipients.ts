export function excludeDmChannelRecipients<T extends { id: string }>(recipients: T[], excluded_recipient_ids: readonly string[]): T[] {
    const excluded_recipient_id_set = new Set(excluded_recipient_ids);
    return recipients.filter((recipient) => !excluded_recipient_id_set.has(recipient.id));
}

export function excludeDmChannelRecipient<T extends { id: string }>(recipients: T[], recipient_id: string): T[] {
    return excludeDmChannelRecipients(recipients, [recipient_id]);
}
