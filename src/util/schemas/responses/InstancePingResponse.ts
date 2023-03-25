export interface InstancePingResponse {
	ping: "pong!";
	instance: {
		id: string;
		name: string;
		description: string | null;
		image: string | null;
		correspondenceEmail: string | null;
		correspondenceUserID: string | null;
		frontPage: string | null;
		tosPage: string | null;
	};
}
