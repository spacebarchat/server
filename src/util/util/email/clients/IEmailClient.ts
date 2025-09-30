import { SentMessageInfo, Transporter } from "nodemailer";
import { User } from "@spacebar/util*";

export interface IEmail {
	from: string;
	to: string;
	subject: string;
	text: string;
	html: string;
}
export interface IEmailClient {
	init: () => Promise<void>;
	sendMail: (
		email: IEmail,
	) => Promise<void>;
}

export class BaseEmailClient implements IEmailClient {
	async init(): Promise<void> {
		return;
	}
	sendMail(email: IEmail): Promise<void> {
		throw new Error("Method not implemented.");
	}
}