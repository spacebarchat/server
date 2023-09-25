export class FederationConfiguration {
	/**
	 * The S2S api domain, used for federation between instances.
	 * Must match the DNS record that this instance runs on.
	 */
	host: string;

	/** The domain used for account creation. Will appears in user handles, i.e. `@account@spacebar.chat` */
	accountDomain: string;

	enabled: boolean = false;
}
