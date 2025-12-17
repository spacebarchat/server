import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { User } from "./User";
import { Stream } from "./Stream";

@Entity({
    name: "stream_sessions",
})
export class StreamSession extends BaseClass {
    @Column()
    @RelationId((session: StreamSession) => session.stream)
    stream_id: string;

    @JoinColumn({ name: "stream_id" })
    @ManyToOne(() => Stream, {
        onDelete: "CASCADE",
    })
    stream: Stream;

    @Column()
    @RelationId((session: StreamSession) => session.user)
    user_id: string;

    @JoinColumn({ name: "user_id" })
    @ManyToOne(() => User, {
        onDelete: "CASCADE",
    })
    user: User;

    @Column({ nullable: true })
    token: string;

    // this is for gateway session
    @Column()
    session_id: string;

    @Column({ default: false })
    used: boolean;
}
