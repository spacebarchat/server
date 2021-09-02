import { User } from "./User";
import { BaseClass } from "./BaseClass";
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from "typeorm";

//TODO we need to remove all sessions on server start because if the server crashes without closing websockets it won't delete them


@Entity("sessions")
export class Session extends BaseClass {
    @Column({ nullable: true })
    @RelationId((session: Session) => session.user)
    user_id: string;

    @JoinColumn({ name: "user_id" })
    @ManyToOne(() => User)
    user: User;

    //TODO check, should be 32 char long hex string
    @Column({ nullable: false })
    session_id: string;

    activities: []; //TODO

    @Column({ type: "simple-json", select: false })
    client_info: {
        client: string,
        os: string,
        version: number
    }

    @Column({ nullable: false })
    status: string; //TODO enum
}
