export function resolveReactionTargetUserId(routeUserId: string, requestUserId: string) {
    return routeUserId === "@me" ? requestUserId : routeUserId;
}

export function isOwnReactionTarget(routeUserId: string) {
    return routeUserId === "@me";
}
