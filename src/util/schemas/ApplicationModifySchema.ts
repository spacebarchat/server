export interface ApplicationModifySchema {
	description?: string;
	icon?: string;
	interactions_endpoint_url?: string;
	max_participants?: number | null;
	name?: string;
	privacy_policy_url?: string;
	role_connections_verification_url?: string;
	tags?: string[];
	terms_of_service_url?: string;
	bot_public?: boolean;
	bot_require_code_grant?: boolean;
	flags?: number;
}