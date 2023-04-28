export interface LocationMetadataResponse {
	consent_required: boolean;
	country_code: string;
	promotional_email_opt_in: { required: true; pre_checked: false };
}
