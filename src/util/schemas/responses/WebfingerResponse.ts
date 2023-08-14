interface WebfingerLink {
	rel: string;
	type: string;
	href: string;
	template?: string;
}

export interface WebfingerResponse {
	subject: string;
	aliases: string[];
	links: WebfingerLink[];
}
