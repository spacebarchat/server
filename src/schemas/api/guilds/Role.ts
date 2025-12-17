export class RoleColors {
	primary_color: number;
	secondary_color: number | undefined; // only used for "holographic" and "gradient" styles
	tertiary_color?: number | undefined; // only used for "holographic" style

	toJSON(): RoleColors {
		return {
			...this,
			secondary_color: this.secondary_color ?? undefined,
			tertiary_color: this.tertiary_color ?? undefined,
		};
	}
}
