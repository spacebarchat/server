// TODO: public read receipts & privacy scoping
// TODO: send read state event to all channel members
// TODO: advance-only notification cursor

export interface MessageAcknowledgeSchema {
	manual?: boolean;
	mention_count?: number;
}
