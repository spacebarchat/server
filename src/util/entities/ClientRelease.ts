import { Column, Entity} from "typeorm";
import { BaseClass } from "./BaseClass";

@Entity("client_release")
export class Release extends BaseClass {
	@Column()
	name: string;

	@Column()
	pub_date: string;

	@Column()
	url: string;

	@Column()
	deb_url: string;

	@Column()
	osx_url: string;

	@Column()
	win_url: string;

	@Column({ nullable: true })
	notes?: string;
}
