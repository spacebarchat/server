import { User, Webhook } from "../../entities";

export interface WebhookCreateResponse {
	user: User;
	hook: Webhook;
}
