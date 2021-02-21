export const BanCreateSchema = {
	$delete_message_days: String,
	$reason: String,
};

export interface BanCreateSchema {
	delete_message_days?: string;
	reason?: string;
}
