import "reflect-metadata";
import { Column, Entity, JoinColumn, ManyToOne, Relation, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Channel } from "./Channel";
import { Guild } from "./Guild";
import { User } from "./User";
import { Member } from "./Member";

//https://gist.github.com/vassjozsef/e482c65df6ee1facaace8b3c9ff66145#file-voice_state-ex
@Entity("voice_states")
export class VoiceState extends BaseClass {
	@Column({ nullable: true })
	@RelationId((voice_state: VoiceState) => voice_state.guild)
	guild_id: string;

	@JoinColumn({ name: "guild_id" })
	@ManyToOne(() => Guild, {
		onDelete: "CASCADE"
	})
	guild?: Relation<Guild>;

	@Column({ nullable: true })
	@RelationId((voice_state: VoiceState) => voice_state.channel)
	channel_id: string;

	@JoinColumn({ name: "channel_id" })
	@ManyToOne(() => Channel, {
		onDelete: "CASCADE"
	})
	channel: Relation<Channel>;

	@Column({ nullable: true })
	@RelationId((voice_state: VoiceState) => voice_state.user)
	user_id: string;

	@JoinColumn({ name: "user_id" })
	@ManyToOne(() => User, {
		onDelete: "CASCADE"
	})
	user: Relation<User>;

	// @JoinColumn([{ name: "user_id", referencedColumnName: "id" },{ name: "guild_id", referencedColumnName: "guild_id" }])
	// @ManyToOne(() => Member, {
	// 	onDelete: "CASCADE",
	// })
	//TODO find a way to make it work without breaking Guild.voice_states
	member: Relation<Member>;

	@Column()
	session_id: string;

	@Column({ nullable: true })
	token?: string;

	@Column()
	deaf: boolean;

	@Column()
	mute: boolean;

	@Column()
	self_deaf: boolean;

	@Column()
	self_mute: boolean;

	@Column({ nullable: true })
	self_stream?: boolean;

	@Column()
	self_video: boolean;

	@Column()
	suppress: boolean; // whether this user is muted by the current user

	@Column({ nullable: true, default: null })
	request_to_speak_timestamp?: Date;
}
