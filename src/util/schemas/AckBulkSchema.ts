export interface AckBulkSchema {
	read_states: [
		{
			channel_id: string;
			message_id: string;
			read_state_type: number; // WHat is this?
		},
	];
}
