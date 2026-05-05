/// Change history:
/// 1 - Initial version with HS256
/// 2 - Switched to ES512
/// 3 - Add version, device id to token payload
/// 4 - Move user id from custom id claim to standard sub claim
export const CurrentTokenFormatVersion: number = 4;

export type TokenPayload = {
    id?: string;
    sub?: string;
    iat: number;
    // key id
    kid?: string;
    // token format version
    ver?: number;
    // device id
    did?: string;
};

export function getTokenUserId(decoded: TokenPayload) {
    if (decoded.sub && decoded.id && decoded.sub !== decoded.id) return undefined;
    return decoded.sub ?? decoded.id;
}

export function createTokenPayload(userId: string, issuedAt: number, keyId: string, deviceId: string): TokenPayload {
    return {
        sub: userId,
        iat: issuedAt,
        kid: keyId,
        ver: CurrentTokenFormatVersion,
        did: deviceId,
    };
}
