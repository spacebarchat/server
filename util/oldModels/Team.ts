export interface Team {
	icon: string | null;
	id: string;
	members: {
		membership_state: number;
		permissions: string[];
		team_id: string;
		user_id: string;
	}[];
	name: string;
	owner_user_id: string;
}

export enum TeamMemberState {
	INVITED = 1,
	ACCEPTED = 2,
}
