import { OPCODES, Payload } from "../util/Constants";

export interface QoSPayload {
    ver: number;
    active: boolean;
    reasons: string[];
}

export interface QoSHeartbeatData {
    seq?: number | null;
    qos: QoSPayload;
}

export function isValidHeartbeatPayload(data: Payload) {
    if (data.op === OPCODES.Heartbeat) {
        return isFiniteNumberOrNull(data.d);
    }

    if (data.op !== OPCODES.SetQoS || !data.d || typeof data.d !== "object" || Array.isArray(data.d)) {
        return false;
    }

    const payload = data.d as Partial<QoSHeartbeatData>;
    const qos = payload.qos as Partial<QoSPayload> | undefined;
    return (
        isOptionalFiniteNumberOrNull(payload.seq) &&
        !!qos &&
        typeof qos === "object" &&
        !Array.isArray(qos) &&
        isFiniteNumber(qos.ver) &&
        typeof qos.active === "boolean" &&
        Array.isArray(qos.reasons) &&
        qos.reasons.every((reason) => typeof reason === "string")
    );
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

function isFiniteNumberOrNull(value: unknown): value is number | null {
    return value === null || isFiniteNumber(value);
}

function isOptionalFiniteNumberOrNull(value: unknown): value is number | null | undefined {
    return value === undefined || isFiniteNumberOrNull(value);
}
