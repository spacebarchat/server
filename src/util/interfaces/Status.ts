export type Status = "idle" | "dnd" | "online" | "offline" | "invisible";

export interface ClientStatus {
	desktop?: string; // e.g. Windows/Linux/Mac
	mobile?: string; // e.g. iOS/Android
	web?: string; // e.g. browser, bot account
}
