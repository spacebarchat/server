export declare type Status = "idle" | "dnd" | "online" | "offline";
export interface ClientStatus {
    desktop?: string;
    mobile?: string;
    web?: string;
}
export declare const ClientStatus: {
    desktop: StringConstructor;
    mobile: StringConstructor;
    web: StringConstructor;
};
