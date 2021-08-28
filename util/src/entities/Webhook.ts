import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { Application } from "./Application";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { User } from "./User";

export enum WebhookType {
	Incoming = 1,
	ChannelFollower = 2,
}

@Entity("webhooks")
export class Webhook extends BaseClass {
	@Column()
	id: string;

	@Column({ type: "simple-enum", enum: WebhookType })
	type: WebhookType;

	@Column({ nullable: true })
	name?: string;

	@Column({ nullable: true })
	avatar?: string;

	@Column({ nullable: true })
	token?: string;

	@RelationId((webhook: Webhook) => webhook.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	guild: Guild;

	@RelationId((webhook: Webhook) => webhook.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, (channel: Channel) => channel.id)
	channel: Channel;

	@RelationId((webhook: Webhook) => webhook.application)
	application_id: string;

	@JoinColumn({ name: "application_id" })
	@ManyToOne(() => Application, (application: Application) => application.id)
	application: Application;

	@RelationId((webhook: Webhook) => webhook.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, (user: User) => user.id)
	user: User;

	@RelationId((webhook: Webhook) => webhook.guild)
	source_guild_id: string;

	@JoinColumn({ name: "source_guild_id" })
	@ManyToOne(() => Guild, (guild: Guild) => guild.id)
	source_guild: Guild;
}
