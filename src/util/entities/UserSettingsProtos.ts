/*
	Spacebar: A FOSS re-implementation and extension of the Discord.com backend.
	Copyright (C) 2025 Spacebar and Spacebar Contributors

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

import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { BaseClassWithoutId, PrimaryIdColumn } from "./BaseClass";
import { User } from "./User";
import { FrecencyUserSettings, PreloadedUserSettings } from "discord-protos";

@Entity({
	name: "user_settings_protos",
})
export class UserSettingsProtos extends BaseClassWithoutId {
	@OneToOne(() => User, {
		cascade: true,
		orphanedRowAction: "delete",
		eager: false,
	})
	@JoinColumn({ name: "user_id" })
	user: User;

	@PrimaryIdColumn({ type: "text" })
	user_id: string;

	@Column({ nullable: true, type: String, name: "userSettings" })
	_userSettings: string | undefined;

	@Column({ nullable: true, type: String, name: "frecencySettings" })
	_frecencySettings: string | undefined;

	// @Column({nullable: true, type: "simple-json"})
	// testSettings: {};

	bigintReplacer(_key: string, value: unknown): unknown {
		if (typeof value === "bigint") {
			return (value as bigint).toString();
		} else if (value instanceof Uint8Array) {
			return {
				__type: "Uint8Array",
				data: Array.from(value as Uint8Array)
					.map((b) => b.toString(16).padStart(2, "0"))
					.join(""),
			};
		} else {
			return value;
		}
	}

	bigintReviver(_key: string, value: unknown): unknown {
		if (typeof value === "string" && /^\d+n$/.test(value)) {
			return BigInt((value as string).slice(0, -1));
		} else if (typeof value === "object" && value !== null && "__type" in value) {
			if (value.__type === "Uint8Array" && "data" in value) {
				return new Uint8Array((value.data as string).match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)));
			}
		}
		return value;
	}

	get userSettings(): PreloadedUserSettings | undefined {
		if (!this._userSettings) return undefined;
		return PreloadedUserSettings.fromJson(JSON.parse(this._userSettings, this.bigintReviver));
	}

	set userSettings(value: PreloadedUserSettings | undefined) {
		if (value) {
			// this._userSettings = JSON.stringify(value, this.bigintReplacer);
			this._userSettings = PreloadedUserSettings.toJsonString(value);
		} else {
			this._userSettings = undefined;
		}
	}

	get frecencySettings(): FrecencyUserSettings | undefined {
		if (!this._frecencySettings) return undefined;
		return FrecencyUserSettings.fromJson(JSON.parse(this._frecencySettings, this.bigintReviver));
	}

	set frecencySettings(value: FrecencyUserSettings | undefined) {
		if (value) {
			this._frecencySettings = JSON.stringify(value, this.bigintReplacer);
		} else {
			this._frecencySettings = undefined;
		}
	}

	static async getOrDefault(user_id: string, save: boolean = false): Promise<UserSettingsProtos> {
		const user = await User.findOneOrFail({
			where: { id: user_id },
			select: { settings: true },
		});

		let userSettings = await UserSettingsProtos.findOne({
			where: { user_id },
		});

		let modified = false;
		if (!userSettings) {
			userSettings = UserSettingsProtos.create({
				user_id,
			});
			modified = true;
		}

		if (!userSettings.userSettings) {
			userSettings.userSettings = PreloadedUserSettings.create({
				versions: {
					dataVersion: 0,
					clientVersion: 0,
					serverVersion: 0,
				},
			});
			modified = true;
		}

		if (!userSettings.frecencySettings) {
			userSettings.frecencySettings = FrecencyUserSettings.create({
				versions: {
					dataVersion: 0,
					clientVersion: 0,
					serverVersion: 0,
				},
			});
			modified = true;
		}

		if (modified && save) userSettings = await userSettings.save();

		return userSettings;
	}
}
