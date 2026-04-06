/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2023 Spacebar and Spacebar Contributors
	
	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Session, Status } from "@spacebar/util";

export function genSessionId() {
    return genRanHex(32);
}

export function genVoiceToken() {
    return genRanHex(16);
}

function genRanHex(size: number) {
    return [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function getMostRelevantSession(sessions: Session[]): Session {
    const statusPriority: Record<Status, number> = {
        online: 0,
        idle: 1,
        dnd: 2,
        invisible: 3,
        offline: 4,
    };

    const getPriority = (status: unknown) => {
        return statusPriority[(status as Status) ?? "offline"] ?? 5;
    };

    return sessions.slice().sort((a, b) => {
        const statusDiff = getPriority(a.status) - getPriority(b.status);
        const activityDiff = (b.activities?.length ?? 0) - (a.activities?.length ?? 0);
        return statusDiff || activityDiff;
    })[0];
}
