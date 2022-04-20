import { Column, Entity, JoinColumn, ManyToOne, OneToMany, RelationId } from "typeorm";
import { BaseClass } from "./BaseClass";
import { Guild } from "./Guild";
import { PublicUserProjection, User } from "./User";
import { HTTPError } from "lambert-server";
import { containsAll, emitEvent, getPermission, Snowflake, trimSpecial, InvisibleCharacters } from "../util";
import { BitField, BitFieldResolvable, BitFlag } from "../util/BitField";
import { Recipient } from "./Recipient";
import { Message } from "./Message";
import { ReadState } from "./ReadState";
import { Invite } from "./Invite";
import { DmChannelDTO } from "../dtos";

@Entity("security_settings")
export class SecuritySettings extends BaseClass {

  @Column({nullable: true})
  guild_id: Snowflake;

  @Column({nullable: true})
  channel_id: Snowflake;

  @Column()
  encryption_permission_mask: BitField;

  @Column()
  allowed_algorithms: string[];

  @Column()
  current_algorithm: string;

  @Column({nullable: true})
  used_since_message: Snowflake;

}
