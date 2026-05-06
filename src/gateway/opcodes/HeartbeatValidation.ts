import { OPCODES, Payload } from "../util/Constants";

interface QoSPayload {
    ver: number;
    active: boolean;
    reasons: string[];
}

interface QoSData {
    seq: number | null;
    qos: QoSPayload;
}

export function isValidHeartbeatPayload(data: Payload) {
    if (data.op === OPCODES.Heartbeat) {
        return data.d === null || (typeof data.d === "number" && Number.isFinite(data.d));
    }

    if (data.op !== OPCODES.SetQoS || !data.d || typeof data.d !== "object" || Array.isArray(data.d)) {
        return false;
    }

    const payload = data.d as Partial<QoSData>;
    const qos = payload.qos as Partial<QoSPayload> | undefined;
    return (
        (payload.seq === null || (typeof payload.seq === "number" && Number.isFinite(payload.seq))) &&
        !!qos &&
        typeof qos === "object" &&
        !Array.isArray(qos) &&
        typeof qos.ver === "number" &&
        Number.isFinite(qos.ver) &&
        typeof qos.active === "boolean" &&
        Array.isArray(qos.reasons) &&
        qos.reasons.every((reason) => typeof reason === "string")
    );
}
